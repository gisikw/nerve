module Main exposing (main)

import Browser
import Browser.Events
import Html exposing (Html, div, h3, input, li, span, text, ul)
import Html.Attributes exposing (autofocus, class, id, placeholder, spellcheck, type_, value)
import Html.Events exposing (onClick, onInput)
import Json.Decode as D
import Model exposing (Model, Msg(..), Page(..), initialModel)
import Ports
import Set
import Task
import Time
import Types exposing (Room)
import Update
import View.Login
import View.Messages
import View.Sidebar


main : Program D.Value Model Msg
main =
    Browser.element
        { init = init
        , update = Update.update
        , view = view
        , subscriptions = subscriptions
        }


init : D.Value -> ( Model, Cmd Msg )
init flags =
    let
        archivedIds =
            flags
                |> D.decodeValue (D.field "archivedRooms" (D.list D.string))
                |> Result.withDefault []
                |> Set.fromList

        model =
            { initialModel | archivedRoomIds = archivedIds }
    in
    ( model, Task.perform GotTimeZone Time.here )


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

                else if model.shortcutsOpen then
                    [ shortcutsModal ]

                else
                    []
               )
        )


switcherModal : Model -> Html Msg
switcherModal model =
    let
        rooms =
            Update.filteredRooms model

        resultsContent =
            if List.isEmpty rooms && not (String.isEmpty (String.trim model.switcherQuery)) then
                [ li [ class "switcher-hint" ]
                    [ text ("Press Enter to create \"" ++ String.trim model.switcherQuery ++ "\"") ]
                ]

            else
                List.indexedMap (switcherItem model.switcherIndex) rooms
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
            , ul [ id "switcher-results" ] resultsContent
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


shortcutsModal : Html Msg
shortcutsModal =
    let
        shortcut keys desc =
            li [ class "shortcut-row" ]
                [ span [ class "shortcut-keys" ] (List.map (\k -> span [ class "kbd" ] [ text k ]) keys)
                , span [ class "shortcut-desc" ] [ text desc ]
                ]
    in
    div [ id "switcher-backdrop", onClick CloseShortcuts ]
        [ div [ id "shortcuts-modal", onClickStop ]
            [ Html.h3 [] [ text "Keyboard shortcuts" ]
            , ul [ class "shortcuts-list" ]
                [ shortcut [ "\u{2318}/Ctrl", "K" ] "Channel switcher"
                , shortcut [ "\u{2318}/Ctrl", "/" ] "This help"
                , shortcut [ "\u{2318}/Ctrl", "+/\u{2212}/0" ] "Zoom in / out / reset"
                , shortcut [ "Enter" ] "Send message"
                , shortcut [ "Shift", "Enter" ] "New line"
                , shortcut [ "Esc" ] "Close modal"
                ]
            ]
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
                                , Ports.onScrollNearTop (\_ -> LoadOlderMessages)
                                , Ports.onScrollNearBottom (\_ -> ResumePolling)
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


{-| Decode Cmd/Ctrl+K and Cmd/Ctrl+/ keyboard shortcuts.
-}
cmdKDecoder : D.Decoder Msg
cmdKDecoder =
    D.map3
        (\key ctrl meta ->
            if (ctrl || meta) && key == "k" then
                Just OpenSwitcher

            else if (ctrl || meta) && key == "/" then
                Just OpenShortcuts

            else if key == "Escape" then
                Just CloseShortcuts

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
                        D.fail "not a shortcut"
            )
