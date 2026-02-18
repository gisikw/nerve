module View.Sidebar exposing (view)

import Html exposing (Html, aside, button, div, li, span, text, ul)
import Html.Attributes exposing (class, id, title)
import Html.Events exposing (onClick)
import Json.Decode
import Model exposing (Model, Msg(..))
import Set
import Types exposing (Room)


view : Model -> Html Msg
view model =
    let
        ( activeRooms, archivedRooms ) =
            List.partition (\r -> not (Set.member r.id model.archivedRoomIds)) model.rooms

        archivedSection =
            if List.isEmpty archivedRooms then
                []

            else
                [ div [ class "sidebar-section-header", onClick ToggleArchived ]
                    [ span [ class "section-toggle" ]
                        [ text
                            (if model.showArchived then
                                "\u{25BC}"

                             else
                                "\u{25B6}"
                            )
                        ]
                    , span [] [ text ("Archived (" ++ String.fromInt (List.length archivedRooms) ++ ")") ]
                    ]
                ]
                    ++ (if model.showArchived then
                            [ ul [ class "room-list archived-rooms" ]
                                (List.map (roomItem model.selectedRoomId True) archivedRooms)
                            ]

                        else
                            []
                       )
    in
    aside [ id "sidebar" ]
        ([ ul [ id "room-list" ]
            (List.map (roomItem model.selectedRoomId False) activeRooms)
         ]
            ++ archivedSection
            ++ [ div [ id "sidebar-actions" ]
                    [ button [ class "sidebar-action-btn", title "Join or create a room (Cmd+K)", onClick OpenSwitcher ]
                        [ text "+" ]
                    ]
               ]
        )


roomItem : Maybe String -> Bool -> Room -> Html Msg
roomItem selectedId isArchived room =
    let
        isSelected =
            selectedId == Just room.id

        hasTyping =
            not (List.isEmpty room.typingUsers)

        classes =
            [ ( "selected", isSelected )
            , ( "unread", room.notificationCount > 0 )
            , ( "typing", hasTyping )
            ]
                |> List.filter Tuple.second
                |> List.map Tuple.first
                |> String.join " "

        archiveBtn =
            if isArchived then
                button
                    [ class "room-action-btn"
                    , title "Unarchive"
                    , onClickStop (UnarchiveRoom room.id)
                    ]
                    [ text "\u{1F4E4}" ]

            else
                button
                    [ class "room-action-btn"
                    , title "Archive"
                    , onClickStop (ArchiveRoom room.id)
                    ]
                    [ text "\u{1F4E5}" ]
    in
    li
        [ onClick (SelectRoom room.id)
        , if String.isEmpty classes then
            class ""

          else
            class classes
        ]
        [ span [ class "room-name-text" ]
            [ text
                (if room.isDirect then
                    room.name

                 else
                    "# " ++ room.name
                )
            ]
        , if hasTyping then
            span [ class "typing-badge" ] [ text "..." ]

          else
            text ""
        , archiveBtn
        ]


{-| Stop propagation so clicking the archive button doesn't also select the room.
-}
onClickStop : Msg -> Html.Attribute Msg
onClickStop msg =
    Html.Events.stopPropagationOn "click"
        (Json.Decode.succeed ( msg, True ))
