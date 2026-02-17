module Decode exposing
    ( room
    , roomList
    , message
    , messageList
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


message : Decoder Message
message =
    D.map6 Message
        (D.field "event_id" D.string)
        (D.field "sender" D.string)
        (D.field "body" D.string)
        (D.field "timestamp" D.int)
        (D.field "msg_type" D.string)
        (D.maybe (D.field "media_url" D.string))


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
