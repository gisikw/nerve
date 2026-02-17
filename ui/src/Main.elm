module Main exposing (main)

import Browser
import Browser.Events
import Html exposing (Html, button, div, header, span, text)
import Html.Attributes exposing (class, id)
import Html.Events exposing (onClick)
import Json.Decode as D
import Model exposing (Model, Msg(..), Page(..), initialModel)
import Ports
import Task
import Time
import Update
import View.Login
import View.Messages
import View.Sidebar


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = Update.update
        , view = view
        , subscriptions = subscriptions
        }


init : () -> ( Model, Cmd Msg )
init _ =
    ( initialModel, Task.perform GotTimeZone Time.here )


view : Model -> Html Msg
view model =
    case model.page of
        LoginPage ->
            View.Login.view model

        MainPage ->
            mainView model


mainView : Model -> Html Msg
mainView model =
    div [ id "main-view", class "view" ]
        [ header []
            [ span [] [ text "Nerve" ]
            , button [ id "logout-btn", onClick Logout ]
                [ text "Log out" ]
            ]
        , div [ id "layout" ]
            [ View.Sidebar.view model
            , Html.main_ [ id "chat" ]
                [ View.Messages.view model ]
            ]
        ]


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Ports.receiveFromTauri ReceivedFromTauri
        , case model.page of
            MainPage ->
                Sub.batch
                    [ Time.every 5000 (\_ -> PollRooms)
                    , case model.selectedRoomId of
                        Just _ ->
                            Sub.batch
                                [ Time.every 3000 (\_ -> PollMessages)
                                , Browser.Events.onKeyDown printableKeyDecoder
                                ]

                        Nothing ->
                            Sub.none
                    ]

            LoginPage ->
                Sub.none
        ]


{-| Decode keydown events, succeeding only for printable single-character
keys with no modifier held. Used to redirect typing to the compose input.
-}
printableKeyDecoder : D.Decoder Msg
printableKeyDecoder =
    D.map4
        (\key ctrl meta alt ->
            if ctrl || meta || alt then
                Nothing

            else if String.length key /= 1 then
                Nothing

            else
                Just (KeyPressed key)
        )
        (D.field "key" D.string)
        (D.field "ctrlKey" D.bool)
        (D.field "metaKey" D.bool)
        (D.field "altKey" D.bool)
        |> D.andThen
            (\maybe ->
                case maybe of
                    Just msg ->
                        D.succeed msg

                    Nothing ->
                        D.fail "not a printable key"
            )
