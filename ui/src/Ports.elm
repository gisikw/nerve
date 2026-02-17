port module Ports exposing
    ( sendToTauri
    , receiveFromTauri
    )

import Json.Encode as E


port sendToTauri : E.Value -> Cmd msg


port receiveFromTauri : (E.Value -> msg) -> Sub msg
