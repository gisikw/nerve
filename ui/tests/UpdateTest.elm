module UpdateTest exposing (suite)

import Expect
import Json.Encode as E
import Model exposing (Model, Msg(..), Page(..), initialModel)
import Test exposing (..)
import Update exposing (update)


suite : Test
suite =
    describe "Update"
        [ describe "Login form"
            [ test "SetHomeserver updates form" <|
                \_ ->
                    update (SetHomeserver "matrix.org") initialModel
                        |> Tuple.first
                        |> .loginForm
                        |> .homeserver
                        |> Expect.equal "matrix.org"
            , test "SetUsername updates form" <|
                \_ ->
                    update (SetUsername "kevin") initialModel
                        |> Tuple.first
                        |> .loginForm
                        |> .username
                        |> Expect.equal "kevin"
            , test "SetPassword updates form" <|
                \_ ->
                    update (SetPassword "secret") initialModel
                        |> Tuple.first
                        |> .loginForm
                        |> .password
                        |> Expect.equal "secret"
            , test "SubmitLogin sets loading and clears error" <|
                \_ ->
                    let
                        model =
                            { initialModel | loginError = Just "old error" }

                        ( newModel, _ ) =
                            update SubmitLogin model
                    in
                    Expect.all
                        [ \m -> Expect.equal True m.loginLoading
                        , \m -> Expect.equal Nothing m.loginError
                        ]
                        newModel
            ]
        , describe "SelectRoom"
            [ test "sets selectedRoomId and clears messages" <|
                \_ ->
                    let
                        model =
                            { initialModel | page = MainPage, messages = [ testMessage ] }

                        ( newModel, _ ) =
                            update (SelectRoom "!room:x") model
                    in
                    Expect.all
                        [ \m -> Expect.equal (Just "!room:x") m.selectedRoomId
                        , \m -> Expect.equal [] m.messages
                        , \m -> Expect.equal True m.messagesLoading
                        ]
                        newModel
            ]
        , describe "Compose"
            [ test "SetComposeText updates text" <|
                \_ ->
                    update (SetComposeText "hello") initialModel
                        |> Tuple.first
                        |> .composeText
                        |> Expect.equal "hello"
            , test "SubmitMessage clears compose text" <|
                \_ ->
                    let
                        model =
                            { initialModel | selectedRoomId = Just "!r:x", composeText = "hi" }
                    in
                    update SubmitMessage model
                        |> Tuple.first
                        |> .composeText
                        |> Expect.equal ""
            , test "SubmitMessage with empty text is no-op" <|
                \_ ->
                    let
                        model =
                            { initialModel | selectedRoomId = Just "!r:x", composeText = "  " }
                    in
                    update SubmitMessage model
                        |> Tuple.first
                        |> .composeText
                        |> Expect.equal "  "
            , test "SubmitMessage with no room is no-op" <|
                \_ ->
                    let
                        model =
                            { initialModel | composeText = "hello" }
                    in
                    update SubmitMessage model
                        |> Tuple.first
                        |> .composeText
                        |> Expect.equal "hello"
            ]
        , describe "Port responses"
            [ test "checkSession logged in transitions to MainPage" <|
                \_ ->
                    let
                        payload =
                            E.object
                                [ ( "tag", E.string "checkSession" )
                                , ( "payload"
                                  , E.object
                                        [ ( "logged_in", E.bool True )
                                        , ( "user_id", E.string "@kev:x" )
                                        ]
                                  )
                                ]

                        ( newModel, _ ) =
                            update (ReceivedFromTauri payload) initialModel
                    in
                    Expect.all
                        [ \m -> Expect.equal MainPage m.page
                        , \m -> Expect.equal (Just "@kev:x") m.userId
                        ]
                        newModel
            , test "checkSession not logged in stays on LoginPage" <|
                \_ ->
                    let
                        payload =
                            E.object
                                [ ( "tag", E.string "checkSession" )
                                , ( "payload"
                                  , E.object
                                        [ ( "logged_in", E.bool False )
                                        ]
                                  )
                                ]

                        ( newModel, _ ) =
                            update (ReceivedFromTauri payload) initialModel
                    in
                    Expect.equal LoginPage newModel.page
            , test "login success transitions to MainPage" <|
                \_ ->
                    let
                        model =
                            { initialModel | loginLoading = True }

                        payload =
                            E.object
                                [ ( "tag", E.string "login" )
                                , ( "payload"
                                  , E.object [ ( "user_id", E.string "@kev:x" ) ]
                                  )
                                ]

                        ( newModel, _ ) =
                            update (ReceivedFromTauri payload) model
                    in
                    Expect.all
                        [ \m -> Expect.equal MainPage m.page
                        , \m -> Expect.equal (Just "@kev:x") m.userId
                        , \m -> Expect.equal False m.loginLoading
                        ]
                        newModel
            , test "logout transitions to LoginPage" <|
                \_ ->
                    let
                        model =
                            { initialModel
                                | page = MainPage
                                , userId = Just "@kev:x"
                                , rooms = [ testRoom ]
                            }

                        payload =
                            E.object
                                [ ( "tag", E.string "logout" )
                                , ( "payload", E.null )
                                ]

                        ( newModel, _ ) =
                            update (ReceivedFromTauri payload) model
                    in
                    Expect.all
                        [ \m -> Expect.equal LoginPage m.page
                        , \m -> Expect.equal Nothing m.userId
                        , \m -> Expect.equal [] m.rooms
                        ]
                        newModel
            , test "listRooms updates room list" <|
                \_ ->
                    let
                        model =
                            { initialModel | page = MainPage }

                        payload =
                            E.object
                                [ ( "tag", E.string "listRooms" )
                                , ( "payload"
                                  , E.list identity
                                        [ E.object
                                            [ ( "id", E.string "!a:x" )
                                            , ( "name", E.string "General" )
                                            , ( "is_direct", E.bool False )
                                            , ( "notification_count", E.int 2 )
                                            ]
                                        ]
                                  )
                                ]

                        ( newModel, _ ) =
                            update (ReceivedFromTauri payload) model
                    in
                    Expect.equal 1 (List.length newModel.rooms)
            , test "getMessages updates message list" <|
                \_ ->
                    let
                        model =
                            { initialModel
                                | page = MainPage
                                , messagesLoading = True
                            }

                        payload =
                            E.object
                                [ ( "tag", E.string "getMessages" )
                                , ( "payload"
                                  , E.list identity
                                        [ E.object
                                            [ ( "event_id", E.string "$e1" )
                                            , ( "sender", E.string "@a:x" )
                                            , ( "body", E.string "hi" )
                                            , ( "timestamp", E.int 1700000000000 )
                                            , ( "msg_type", E.string "text" )
                                            ]
                                        ]
                                  )
                                ]

                        ( newModel, _ ) =
                            update (ReceivedFromTauri payload) model
                    in
                    Expect.all
                        [ \m -> Expect.equal 1 (List.length m.messages)
                        , \m -> Expect.equal False m.messagesLoading
                        ]
                        newModel
            , test "error during login sets loginError" <|
                \_ ->
                    let
                        model =
                            { initialModel | loginLoading = True }

                        payload =
                            E.object
                                [ ( "tag", E.string "error" )
                                , ( "payload", E.string "Invalid password" )
                                ]

                        ( newModel, _ ) =
                            update (ReceivedFromTauri payload) model
                    in
                    Expect.all
                        [ \m -> Expect.equal False m.loginLoading
                        , \m -> Expect.equal (Just "Invalid password") m.loginError
                        ]
                        newModel
            ]
        ]


testRoom : { id : String, name : String, isDirect : Bool, notificationCount : Int, typingUsers : List String }
testRoom =
    { id = "!test:x", name = "Test", isDirect = False, notificationCount = 0, typingUsers = [] }


testMessage : { eventId : String, sender : String, body : String, timestamp : Int, msgType : String, mediaUrl : Maybe String, reactions : List a }
testMessage =
    { eventId = "$test", sender = "@a:x", body = "hi", timestamp = 0, msgType = "text", mediaUrl = Nothing, reactions = [] }
