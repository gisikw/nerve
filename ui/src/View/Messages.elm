module View.Messages exposing (view)

import Html exposing (Html, button, div, form, h2, img, p, span, text, textarea)
import Html.Attributes exposing (alt, class, id, placeholder, rows, src, title, type_, value)
import Html.Events exposing (onClick, onInput, onSubmit)
import Json.Decode as D
import Markdown
import Model exposing (Model, Msg(..))
import Time
import Types exposing (Message, Reaction)


view : Model -> Html Msg
view model =
    case model.selectedRoomId of
        Nothing ->
            div [ id "no-room-selected" ]
                [ p [] [ text "Select a room" ] ]

        Just _ ->
            div [ id "room-content" ]
                [ roomHeader model
                , messagesArea model
                , typingIndicator model
                , composeBar model
                ]


roomHeader : Model -> Html Msg
roomHeader model =
    let
        roomName =
            model.selectedRoomId
                |> Maybe.andThen (\rid -> List.filter (\r -> r.id == rid) model.rooms |> List.head)
                |> Maybe.map .name
                |> Maybe.withDefault ""
    in
    div [ id "room-header" ]
        [ h2 [ id "room-name" ] [ text roomName ] ]


messagesArea : Model -> Html Msg
messagesArea model =
    if model.messagesLoading && List.isEmpty model.messages then
        div [ id "messages" ]
            [ p [ class "placeholder" ] [ text "Loading..." ] ]

    else if List.isEmpty model.messages then
        div [ id "messages" ]
            [ p [ class "placeholder" ] [ text "No messages yet." ] ]

    else
        div [ id "messages" ]
            (renderGrouped model.timeZone model.messages)


renderGrouped : Time.Zone -> List Message -> List (Html Msg)
renderGrouped zone msgs =
    List.indexedMap
        (\i msg ->
            let
                prev =
                    List.drop (i - 1) msgs |> List.head

                isGroupStart =
                    case prev of
                        Just p ->
                            if i == 0 then
                                True

                            else
                                p.sender /= msg.sender || msg.timestamp - p.timestamp >= 300000

                        Nothing ->
                            True
            in
            renderMessage zone isGroupStart msg
        )
        msgs


renderMessage : Time.Zone -> Bool -> Message -> Html Msg
renderMessage zone isGroupStart msg =
    let
        baseClasses =
            [ "message"
            , if msg.msgType == "notice" then
                "notice"

              else if msg.msgType == "emote" then
                "emote"

              else
                ""
            , if isGroupStart then
                "group-start"

              else
                ""
            ]
                |> List.filter (not << String.isEmpty)
                |> String.join " "
    in
    div [ class baseClasses ]
        ([ if isGroupStart then
            Just (messageHeader zone msg)

           else
            Nothing
         , Just (messageBody msg)
         , if List.isEmpty msg.reactions then
            Nothing

           else
            Just (reactionsRow msg)
         ]
            |> List.filterMap identity
        )


messageHeader : Time.Zone -> Message -> Html Msg
messageHeader zone msg =
    div [ class "message-header" ]
        [ span [ class "sender" ] [ text (formatSender msg.sender) ]
        , span [ class "timestamp" ] [ text (formatTime zone msg.timestamp) ]
        ]


messageBody : Message -> Html Msg
messageBody msg =
    if msg.msgType == "image" then
        case msg.mediaUrl of
            Just url ->
                div [ class "image-container" ]
                    [ img [ src url, alt (msg.body) ] [] ]

            Nothing ->
                div [ class "message-body" ] [ text msg.body ]

    else
        div [ class "message-body" ] (Markdown.render msg.body)


reactionsRow : Message -> Html Msg
reactionsRow msg =
    div [ class "reactions" ]
        (List.map (reactionPill msg.eventId) msg.reactions)


reactionPill : String -> Reaction -> Html Msg
reactionPill eventId reaction =
    button
        [ class
            (if reaction.includeSelf then
                "reaction-pill self"

             else
                "reaction-pill"
            )
        , onClick (SendReaction eventId reaction.emoji)
        , title (reaction.emoji ++ " " ++ String.fromInt reaction.count)
        ]
        [ span [ class "reaction-emoji" ] [ text reaction.emoji ]
        , span [ class "reaction-count" ] [ text (String.fromInt reaction.count) ]
        ]


formatSender : String -> String
formatSender userId =
    case String.split ":" userId of
        localpart :: _ ->
            String.dropLeft 1 localpart

        _ ->
            userId


formatTime : Time.Zone -> Int -> String
formatTime zone tsMillis =
    let
        posix =
            Time.millisToPosix tsMillis

        hour24 =
            Time.toHour zone posix

        hour12 =
            let
                h =
                    modBy 12 hour24
            in
            if h == 0 then
                12

            else
                h

        minutes =
            Time.toMinute zone posix

        ampm =
            if hour24 < 12 then
                "am"

            else
                "pm"

        pad n =
            if n < 10 then
                "0" ++ String.fromInt n

            else
                String.fromInt n
    in
    String.fromInt hour12 ++ ":" ++ pad minutes ++ " " ++ ampm


typingIndicator : Model -> Html Msg
typingIndicator model =
    if List.isEmpty model.typingUsers then
        text ""

    else
        let
            names =
                List.map formatSender model.typingUsers

            label =
                case names of
                    [ one ] ->
                        one ++ " is typing..."

                    [ a, b ] ->
                        a ++ " and " ++ b ++ " are typing..."

                    _ ->
                        String.join ", " (List.take 2 names) ++ " and others are typing..."
        in
        div [ id "typing-indicator" ]
            [ span [ class "typing-dots" ] [ text "..." ]
            , span [ class "typing-text" ] [ text label ]
            ]


composeBar : Model -> Html Msg
composeBar model =
    form [ id "compose", onSubmit SubmitMessage ]
        [ textarea
            [ id "compose-input"
            , placeholder "Send a message..."
            , rows 1
            , value model.composeText
            , onInput SetComposeText
            , onEnter SubmitMessage
            ]
            []
        , Html.button [ type_ "submit" ] [ text "Send" ]
        ]


{-| Submit on Enter, allow Shift+Enter for newlines.
-}
onEnter : Msg -> Html.Attribute Msg
onEnter msg =
    Html.Events.preventDefaultOn "keydown"
        (D.map2 Tuple.pair
            (D.field "key" D.string)
            (D.field "shiftKey" D.bool)
            |> D.andThen
                (\( key, shift ) ->
                    if key == "Enter" && not shift then
                        D.succeed ( msg, True )

                    else
                        D.fail "not Enter"
                )
        )
