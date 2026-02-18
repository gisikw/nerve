module DecodeTest exposing (suite)

import Decode
import Expect
import Json.Decode as D
import Test exposing (..)
import Types exposing (..)


suite : Test
suite =
    describe "Decoders"
        [ describe "room"
            [ test "decodes a room with notifications" <|
                \_ ->
                    let
                        json =
                            """{"id":"!abc:example.org","name":"General","is_direct":false,"notification_count":5}"""
                    in
                    D.decodeString Decode.room json
                        |> Expect.equal
                            (Ok
                                { id = "!abc:example.org"
                                , name = "General"
                                , isDirect = False
                                , notificationCount = 5
                                , typingUsers = []
                                }
                            )
            , test "decodes a direct room with zero notifications" <|
                \_ ->
                    let
                        json =
                            """{"id":"!xyz:example.org","name":"Alice","is_direct":true,"notification_count":0}"""
                    in
                    D.decodeString Decode.room json
                        |> Expect.equal
                            (Ok
                                { id = "!xyz:example.org"
                                , name = "Alice"
                                , isDirect = True
                                , notificationCount = 0
                                , typingUsers = []
                                }
                            )
            ]
        , describe "roomList"
            [ test "decodes an empty list" <|
                \_ ->
                    D.decodeString Decode.roomList "[]"
                        |> Expect.equal (Ok [])
            , test "decodes multiple rooms" <|
                \_ ->
                    let
                        json =
                            """[{"id":"!a:x","name":"A","is_direct":false,"notification_count":0},{"id":"!b:x","name":"B","is_direct":true,"notification_count":3}]"""
                    in
                    D.decodeString Decode.roomList json
                        |> Result.map List.length
                        |> Expect.equal (Ok 2)
            ]
        , describe "message"
            [ test "decodes a text message without media" <|
                \_ ->
                    let
                        json =
                            """{"event_id":"$ev1","sender":"@alice:x","body":"hello","timestamp":1700000000000,"msg_type":"text"}"""
                    in
                    D.decodeString Decode.message json
                        |> Expect.equal
                            (Ok
                                { eventId = "$ev1"
                                , sender = "@alice:x"
                                , body = "hello"
                                , timestamp = 1700000000000
                                , msgType = "text"
                                , mediaUrl = Nothing
                                , reactions = []
                                }
                            )
            , test "decodes an image message with media_url" <|
                \_ ->
                    let
                        json =
                            """{"event_id":"$ev2","sender":"@bob:x","body":"photo.jpg","timestamp":1700000001000,"msg_type":"image","media_url":"https://matrix.example.org/_matrix/media/v3/download/x/abc"}"""
                    in
                    D.decodeString Decode.message json
                        |> Result.map .mediaUrl
                        |> Expect.equal (Ok (Just "https://matrix.example.org/_matrix/media/v3/download/x/abc"))
            , test "decodes a notice message" <|
                \_ ->
                    let
                        json =
                            """{"event_id":"$ev3","sender":"@bot:x","body":"system msg","timestamp":1700000002000,"msg_type":"notice"}"""
                    in
                    D.decodeString Decode.message json
                        |> Result.map .msgType
                        |> Expect.equal (Ok "notice")
            ]
        , describe "messageList"
            [ test "decodes empty message list" <|
                \_ ->
                    D.decodeString Decode.messageList "[]"
                        |> Expect.equal (Ok [])
            ]
        , describe "sessionStatus"
            [ test "decodes logged-in session" <|
                \_ ->
                    let
                        json =
                            """{"logged_in":true,"user_id":"@kevin:example.chat"}"""
                    in
                    D.decodeString Decode.sessionStatus json
                        |> Expect.equal
                            (Ok
                                { loggedIn = True
                                , userId = Just "@kevin:example.chat"
                                }
                            )
            , test "decodes logged-out session" <|
                \_ ->
                    let
                        json =
                            """{"logged_in":false}"""
                    in
                    D.decodeString Decode.sessionStatus json
                        |> Expect.equal
                            (Ok
                                { loggedIn = False
                                , userId = Nothing
                                }
                            )
            ]
        , describe "loginResult"
            [ test "decodes login result" <|
                \_ ->
                    let
                        json =
                            """{"user_id":"@kevin:example.chat"}"""
                    in
                    D.decodeString Decode.loginResult json
                        |> Expect.equal
                            (Ok { userId = "@kevin:example.chat" })
            ]
        ]
