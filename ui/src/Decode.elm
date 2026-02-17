module Decode exposing
    ( room
    , roomList
    , message
    , messageList
    , reaction
    , sessionStatus
    , loginResult
    )

import Json.Decode as D exposing (Decoder)
import Types exposing (..)


room : Decoder Room
room =
    D.map4 Room
        (D.field "id" D.string)
        (D.field "name" D.string)
        (D.field "is_direct" D.bool)
        (D.field "notification_count" D.int)


roomList : Decoder (List Room)
roomList =
    D.list room


reaction : Decoder Reaction
reaction =
    D.map3 Reaction
        (D.field "emoji" D.string)
        (D.field "count" D.int)
        (D.field "include_self" D.bool)


message : Decoder Message
message =
    D.map6
        (\eventId sender body timestamp msgType mediaUrl ->
            \reactions ->
                { eventId = eventId
                , sender = sender
                , body = body
                , timestamp = timestamp
                , msgType = msgType
                , mediaUrl = mediaUrl
                , reactions = reactions
                }
        )
        (D.field "event_id" D.string)
        (D.field "sender" D.string)
        (D.field "body" D.string)
        (D.field "timestamp" D.int)
        (D.field "msg_type" D.string)
        (D.maybe (D.field "media_url" D.string))
        |> andMap (optionalField "reactions" (D.list reaction) [])


optionalField : String -> Decoder a -> a -> Decoder a
optionalField name decoder default =
    D.oneOf
        [ D.field name decoder
        , D.succeed default
        ]


andMap : Decoder a -> Decoder (a -> b) -> Decoder b
andMap argDecoder funcDecoder =
    D.map2 (\f a -> f a) funcDecoder argDecoder


messageList : Decoder (List Message)
messageList =
    D.list message


sessionStatus : Decoder SessionStatus
sessionStatus =
    D.map2 SessionStatus
        (D.field "logged_in" D.bool)
        (D.maybe (D.field "user_id" D.string))


loginResult : Decoder LoginResult
loginResult =
    D.map LoginResult
        (D.field "user_id" D.string)
