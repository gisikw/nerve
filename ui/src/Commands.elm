module Commands exposing
    ( checkSession
    , login
    , logout
    , listRooms
    , getMessages
    , getOlderMessages
    , sendMessage
    , sendReaction
    , getTyping
    , sendTypingNotice
    )

import Json.Encode as E
import Ports
import Types exposing (LoginForm)


send : String -> E.Value -> Cmd msg
send command args =
    Ports.sendToTauri
        (E.object
            [ ( "command", E.string command )
            , ( "args", args )
            ]
        )


checkSession : Cmd msg
checkSession =
    send "checkSession" (E.object [])


login : LoginForm -> Cmd msg
login form =
    send "login"
        (E.object
            [ ( "homeserver", E.string form.homeserver )
            , ( "username", E.string form.username )
            , ( "password", E.string form.password )
            ]
        )


logout : Cmd msg
logout =
    send "logout" (E.object [])


listRooms : Cmd msg
listRooms =
    send "listRooms" (E.object [])


getMessages : String -> Cmd msg
getMessages roomId =
    send "getMessages"
        (E.object [ ( "roomId", E.string roomId ) ])


getOlderMessages : String -> String -> Cmd msg
getOlderMessages roomId fromToken =
    send "getOlderMessages"
        (E.object
            [ ( "roomId", E.string roomId )
            , ( "from", E.string fromToken )
            ]
        )


sendMessage : String -> String -> Cmd msg
sendMessage roomId body =
    send "sendMessage"
        (E.object
            [ ( "roomId", E.string roomId )
            , ( "body", E.string body )
            ]
        )


sendReaction : String -> String -> String -> Cmd msg
sendReaction roomId eventId emoji =
    send "sendReaction"
        (E.object
            [ ( "roomId", E.string roomId )
            , ( "eventId", E.string eventId )
            , ( "emoji", E.string emoji )
            ]
        )


getTyping : String -> Cmd msg
getTyping roomId =
    send "getTyping"
        (E.object [ ( "roomId", E.string roomId ) ])


sendTypingNotice : String -> Bool -> Cmd msg
sendTypingNotice roomId isTyping =
    send "sendTypingNotice"
        (E.object
            [ ( "roomId", E.string roomId )
            , ( "isTyping", E.bool isTyping )
            ]
        )
