module Main exposing (main)

import Browser
import Browser.Events
import Html exposing (Html, div, input, li, span, text, ul)
import Html.Attributes exposing (autofocus, class, id, placeholder, spellcheck, type_, value)
import Html.Events exposing (onClick, onInput)
import Json.Decode as D
import Model exposing (Model, Msg(..), Page(..), initialModel)
import Ports
import Task
import Time
import Types exposing (Room)
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
        ([ div [ id "layout" ]
            [ View.Sidebar.view model
            , Html.main_ [ id "chat" ]
                [ View.Messages.view model ]
            ]
         ]
            ++ (if model.switcherOpen then
                    [ switcherModal model ]

                else
                    []
               )
        )


switcherModal : Model -> Html Msg
switcherModal model =
    let
        rooms =
            Update.filteredRooms model
    in
    div [ id "switcher-backdrop", onClick CloseSwitcher ]
        [ div [ id "switcher-modal", onClickStop ]
            [ input
                [ id "switcher-input"
                , type_ "text"
                , placeholder "Switch to room..."
                , value model.switcherQuery
                , onInput SetSwitcherQuery
                , onSwitcherKey
                , autofocus True
                , spellcheck False
                ]
                []
            , ul [ id "switcher-results" ]
                (List.indexedMap (switcherItem model.switcherIndex) rooms)
            ]
        ]


switcherItem : Int -> Int -> Room -> Html Msg
switcherItem selectedIdx idx room =
    li
        [ class
            (if idx == selectedIdx then
                "switcher-item selected"

             else
                "switcher-item"
            )
        , onClick (SelectRoom room.id)
        ]
        [ text
            (if room.isDirect then
                room.name

             else
                "# " ++ room.name
            )
        ]


onClickStop : Html.Attribute Msg
onClickStop =
    Html.Events.stopPropagationOn "click"
        (D.succeed ( DomNoOp, True ))


onSwitcherKey : Html.Attribute Msg
onSwitcherKey =
    Html.Events.preventDefaultOn "keydown"
        (D.map2 Tuple.pair
            (D.field "key" D.string)
            (D.field "shiftKey" D.bool)
            |> D.andThen
                (\( key, shift ) ->
                    case key of
                        "ArrowUp" ->
                            D.succeed ( SwitcherUp, True )

                        "ArrowDown" ->
                            D.succeed ( SwitcherDown, True )

                        "Tab" ->
                            if shift then
                                D.succeed ( SwitcherUp, True )

                            else
                                D.succeed ( SwitcherDown, True )

                        "Enter" ->
                            D.succeed ( SwitcherSelect, True )

                        "Escape" ->
                            D.succeed ( CloseSwitcher, True )

                        _ ->
                            D.fail "ignore"
                )
        )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Ports.receiveFromTauri ReceivedFromTauri
        , case model.page of
            MainPage ->
                Sub.batch
                    [ Time.every 5000 (\_ -> PollRooms)
                    , Browser.Events.onKeyDown cmdKDecoder
                    , case model.selectedRoomId of
                        Just _ ->
                            Sub.batch
                                [ Time.every 3000 (\_ -> PollMessages)
                                , Time.every 2000 (\_ -> PollTyping)
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


{-| Decode Cmd/Ctrl+K to open the channel switcher.
-}
cmdKDecoder : D.Decoder Msg
cmdKDecoder =
    D.map3
        (\key ctrl meta ->
            if key == "k" && (ctrl || meta) then
                Just OpenSwitcher

            else
                Nothing
        )
        (D.field "key" D.string)
        (D.field "ctrlKey" D.bool)
        (D.field "metaKey" D.bool)
        |> D.andThen
            (\maybe ->
                case maybe of
                    Just msg ->
                        D.succeed msg

                    Nothing ->
                        D.fail "not Cmd+K"
            )
