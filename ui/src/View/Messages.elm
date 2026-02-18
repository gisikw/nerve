module View.Messages exposing (view)

import Html exposing (Html, button, div, form, h2, img, p, span, text, textarea)
import Html.Attributes exposing (alt, attribute, class, id, placeholder, rows, src, title, type_, value)
import Set
import Html.Events exposing (onClick, onInput, onSubmit)
import Json.Decode as D
import Svg
import Svg.Attributes as SvgA
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
                , pinnedBar model
                , messagesArea model
                , typingIndicator model
                , composeBar model
                ]


roomHeader : Model -> Html Msg
roomHeader model =
    let
        selectedRoom =
            model.selectedRoomId
                |> Maybe.andThen (\rid -> List.filter (\r -> r.id == rid) model.rooms |> List.head)

        roomName =
            selectedRoom |> Maybe.map .name |> Maybe.withDefault ""

        topicEl =
            case selectedRoom |> Maybe.andThen .topic of
                Just t ->
                    [ span [ id "room-topic" ] [ text t ] ]

                Nothing ->
                    []
    in
    div [ id "room-header" ]
        [ div [ id "room-info" ]
            (h2 [ id "room-name" ] [ text roomName ] :: topicEl)
        , div [ id "room-header-actions" ]
            [ button
                [ id "tts-toggle"
                , class
                    (if model.ttsEnabled then
                        "active"

                     else
                        ""
                    )
                , onClick ToggleTTS
                , title
                    (if model.ttsEnabled then
                        "Disable text-to-speech"

                     else
                        "Enable text-to-speech"
                    )
                ]
                [ speakerIcon ]
            , button [ id "logout-btn", onClick Logout ] [ text "Log out" ]
            ]
        ]


pinnedBar : Model -> Html Msg
pinnedBar model =
    let
        pinCount =
            Set.size model.pinnedEventIds
    in
    if pinCount == 0 then
        text ""

    else if model.showPinned then
        let
            pinnedMsgs =
                List.filter (\m -> Set.member m.eventId model.pinnedEventIds) model.messages
        in
        div [ id "pinned-bar", class "expanded" ]
            [ div [ class "pinned-bar-header", onClick TogglePinned ]
                [ pinIcon
                , span [ class "pinned-bar-label" ]
                    [ text (String.fromInt pinCount ++ " pinned") ]
                , span [ class "pinned-bar-toggle" ] [ text "Hide" ]
                ]
            , div [ class "pinned-bar-messages" ]
                (List.map pinnedMessagePreview pinnedMsgs)
            ]

    else
        div [ id "pinned-bar", onClick TogglePinned ]
            [ div [ class "pinned-bar-header" ]
                [ pinIcon
                , span [ class "pinned-bar-label" ]
                    [ text (String.fromInt pinCount ++ " pinned") ]
                , span [ class "pinned-bar-toggle" ] [ text "Show" ]
                ]
            ]


pinnedMessagePreview : Message -> Html Msg
pinnedMessagePreview msg =
    div [ class "pinned-message-preview" ]
        [ span [ class "pinned-preview-sender" ] [ text (formatSender msg.sender) ]
        , span [ class "pinned-preview-body" ]
            [ text (String.left 120 msg.body) ]
        , button
            [ class "pinned-preview-unpin"
            , onClick (UnpinMessage msg.eventId)
            , title "Unpin"
            ]
            [ text "Unpin" ]
        ]


messagesArea : Model -> Html Msg
messagesArea model =
    if model.messagesLoading && List.isEmpty model.messages then
        div [ id "messages" ]
            [ p [ class "placeholder" ] [ text "Loading..." ] ]

    else if List.isEmpty model.messages then
        div [ id "messages" ]
            [ p [ class "placeholder" ] [ text "No messages yet." ] ]

    else
        let
            loadingEl =
                if model.loadingOlder then
                    [ p [ class "loading-older" ] [ text "Loading older messages..." ] ]

                else
                    []
        in
        div [ id "messages" ]
            (loadingEl ++ renderGrouped model.timeZone model.pinnedEventIds model.messages)


renderGrouped : Time.Zone -> Set.Set String -> List Message -> List (Html Msg)
renderGrouped zone pinnedIds msgs =
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
            renderMessage zone pinnedIds isGroupStart msg
        )
        msgs


renderMessage : Time.Zone -> Set.Set String -> Bool -> Message -> Html Msg
renderMessage zone pinnedIds isGroupStart msg =
    let
        isPinned =
            Set.member msg.eventId pinnedIds

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
            , if isPinned then
                "pinned"

              else
                ""
            ]
                |> List.filter (not << String.isEmpty)
                |> String.join " "

        pinAction =
            if isPinned then
                UnpinMessage msg.eventId

            else
                PinMessage msg.eventId

        pinLabel =
            if isPinned then
                "Unpin"

            else
                "Pin"
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
         , Just
            (div [ class "message-actions" ]
                [ button
                    [ class "message-action-btn"
                    , onClick (SpeakMessage msg.body)
                    , title "Speak"
                    ]
                    [ speakerIcon ]
                , button
                    [ class "message-action-btn"
                    , onClick pinAction
                    , title pinLabel
                    ]
                    [ pinIcon ]
                ]
            )
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
    let
        roomIdAttr =
            case model.selectedRoomId of
                Just rid ->
                    [ attribute "data-room-id" rid ]

                Nothing ->
                    []
    in
    form ([ id "compose", onSubmit SubmitMessage ] ++ roomIdAttr)
        [ textarea
            [ id "compose-input"
            , placeholder "Send a message..."
            , rows 1
            , value model.composeText
            , onInput SetComposeText
            , onEnter SubmitMessage
            ]
            []
        , Html.button [ type_ "submit", class "send-btn", title "Send message" ]
            [ sendIcon ]
        ]


pinIcon : Html msg
pinIcon =
    Svg.svg
        [ SvgA.viewBox "0 0 24 24"
        , SvgA.width "14"
        , SvgA.height "14"
        , SvgA.fill "none"
        , SvgA.stroke "currentColor"
        , SvgA.strokeWidth "2"
        , SvgA.strokeLinecap "round"
        , SvgA.strokeLinejoin "round"
        ]
        [ Svg.line [ SvgA.x1 "12", SvgA.y1 "17", SvgA.x2 "12", SvgA.y2 "22" ] []
        , Svg.path [ SvgA.d "M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" ] []
        ]


speakerIcon : Html msg
speakerIcon =
    Svg.svg
        [ SvgA.viewBox "0 0 24 24"
        , SvgA.width "14"
        , SvgA.height "14"
        , SvgA.fill "none"
        , SvgA.stroke "currentColor"
        , SvgA.strokeWidth "2"
        , SvgA.strokeLinecap "round"
        , SvgA.strokeLinejoin "round"
        ]
        [ Svg.polygon [ SvgA.points "11 5 6 9 2 9 2 15 6 15 11 19 11 5" ] []
        , Svg.path [ SvgA.d "M15.54 8.46a5 5 0 0 1 0 7.07" ] []
        , Svg.path [ SvgA.d "M19.07 4.93a10 10 0 0 1 0 14.14" ] []
        ]


sendIcon : Html msg
sendIcon =
    Svg.svg
        [ SvgA.viewBox "0 0 24 24"
        , SvgA.width "18"
        , SvgA.height "18"
        , SvgA.fill "none"
        , SvgA.stroke "currentColor"
        , SvgA.strokeWidth "2"
        , SvgA.strokeLinecap "round"
        , SvgA.strokeLinejoin "round"
        ]
        [ Svg.line [ SvgA.x1 "22", SvgA.y1 "2", SvgA.x2 "11", SvgA.y2 "13" ] []
        , Svg.polygon [ SvgA.points "22 2 15 22 11 13 2 9 22 2" ] []
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
