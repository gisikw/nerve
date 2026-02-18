module Commands exposing
    ( checkSession
    , login
    , logout
    , listRooms
    , getMessages
    , getOlderMessages
    , markRead
    , sendMessage
    , sendReaction
    , getPinnedEvents
    , pinMessage
    , unpinMessage
    , getTyping
    , sendTypingNotice
    , createRoom
    , getStreams
    , sendStreamAction
    , speakText
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


markRead : String -> String -> Cmd msg
markRead roomId eventId =
    send "markRead"
        (E.object
            [ ( "roomId", E.string roomId )
            , ( "eventId", E.string eventId )
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


getPinnedEvents : String -> Cmd msg
getPinnedEvents roomId =
    send "getPinnedEvents"
        (E.object [ ( "roomId", E.string roomId ) ])


pinMessage : String -> String -> Cmd msg
pinMessage roomId eventId =
    send "pinMessage"
        (E.object
            [ ( "roomId", E.string roomId )
            , ( "eventId", E.string eventId )
            ]
        )


unpinMessage : String -> String -> Cmd msg
unpinMessage roomId eventId =
    send "unpinMessage"
        (E.object
            [ ( "roomId", E.string roomId )
            , ( "eventId", E.string eventId )
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


createRoom : String -> Cmd msg
createRoom name =
    send "createRoom"
        (E.object [ ( "name", E.string name ) ])


getStreams : String -> Cmd msg
getStreams roomId =
    send "getStreams"
        (E.object [ ( "roomId", E.string roomId ) ])


sendStreamAction : String -> String -> String -> Cmd msg
sendStreamAction roomId streamId buttonId =
    send "sendStreamAction"
        (E.object
            [ ( "roomId", E.string roomId )
            , ( "streamId", E.string streamId )
            , ( "buttonId", E.string buttonId )
            ]
        )


speakText : String -> Cmd msg
speakText body =
    send "speakText"
        (E.object [ ( "text", E.string body ) ])
