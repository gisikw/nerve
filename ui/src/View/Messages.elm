module View.Messages exposing (view)

import Html exposing (Html, div, form, h2, img, p, span, text, textarea)
import Html.Attributes exposing (alt, class, id, placeholder, rows, src, type_, value)
import Html.Events exposing (onInput, onSubmit)
import Json.Decode as D
import Model exposing (Model, Msg(..))
import Types exposing (Message)


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
            (renderGrouped model.messages)


renderGrouped : List Message -> List (Html Msg)
renderGrouped msgs =
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
            renderMessage isGroupStart msg
        )
        msgs


renderMessage : Bool -> Message -> Html Msg
renderMessage isGroupStart msg =
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
            Just (messageHeader msg)

           else
            Nothing
         , Just (messageBody msg)
         ]
            |> List.filterMap identity
        )


messageHeader : Message -> Html Msg
messageHeader msg =
    div [ class "message-header" ]
        [ span [ class "sender" ] [ text (formatSender msg.sender) ]
        , span [ class "timestamp" ] [ text (formatTime msg.timestamp) ]
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
        div [ class "message-body" ] [ text msg.body ]


formatSender : String -> String
formatSender userId =
    case String.split ":" userId of
        localpart :: _ ->
            String.dropLeft 1 localpart

        _ ->
            userId


formatTime : Int -> String
formatTime tsMillis =
    let
        totalMinutes =
            tsMillis // 60000

        hours =
            modBy 24 (totalMinutes // 60)

        minutes =
            modBy 60 totalMinutes

        pad n =
            if n < 10 then
                "0" ++ String.fromInt n

            else
                String.fromInt n
    in
    pad hours ++ ":" ++ pad minutes


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
