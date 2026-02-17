module Main exposing (main)

import Browser
import Html exposing (Html, button, div, header, span, text)
import Html.Attributes exposing (class, id)
import Html.Events exposing (onClick)
import Model exposing (Model, Msg(..), Page(..), initialModel)
import Ports
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
    ( initialModel, Cmd.none )


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
            [ span [ id "user-id" ]
                [ text (Maybe.withDefault "" model.userId) ]
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
                            Time.every 3000 (\_ -> PollMessages)

                        Nothing ->
                            Sub.none
                    ]

            LoginPage ->
                Sub.none
        ]
