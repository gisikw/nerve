module Commands exposing
    ( checkSession
    , login
    , logout
    , listRooms
    , getMessages
    , sendMessage
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


sendMessage : String -> String -> Cmd msg
sendMessage roomId body =
    send "sendMessage"
        (E.object
            [ ( "roomId", E.string roomId )
            , ( "body", E.string body )
            ]
        )
