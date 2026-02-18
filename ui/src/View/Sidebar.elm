module View.Sidebar exposing (view)

import Html exposing (Html, aside, button, div, li, span, text, ul)
import Html.Attributes exposing (class, id, title)
import Html.Events exposing (onClick)
import Model exposing (Model, Msg(..))
import Types exposing (Room)


view : Model -> Html Msg
view model =
    aside [ id "sidebar" ]
        [ ul [ id "room-list" ]
            (List.map (roomItem model.selectedRoomId) model.rooms)
        , div [ id "sidebar-actions" ]
            [ button [ class "sidebar-action-btn", title "Join or create a room" ]
                [ text "+" ]
            ]
        ]


roomItem : Maybe String -> Room -> Html Msg
roomItem selectedId room =
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

          else if room.notificationCount > 0 then
            span [ class "unread-badge" ]
                [ text
                    (if room.notificationCount > 99 then
                        "99+"

                     else
                        String.fromInt room.notificationCount
                    )
                ]

          else
            text ""
        ]
