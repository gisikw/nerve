module Types exposing
    ( Room
    , Message
    , Reaction
    , SessionStatus
    , LoginResult
    , LoginForm
    )


type alias Room =
    { id : String
    , name : String
    , isDirect : Bool
    , notificationCount : Int
    }


type alias Reaction =
    { emoji : String
    , count : Int
    , includeSelf : Bool
    }


type alias Message =
    { eventId : String
    , sender : String
    , body : String
    , timestamp : Int
    , msgType : String
    , mediaUrl : Maybe String
    , reactions : List Reaction
    }


type alias SessionStatus =
    { loggedIn : Bool
    , userId : Maybe String
    }


type alias LoginResult =
    { userId : String
    }


type alias LoginForm =
    { homeserver : String
    , username : String
    , password : String
    }
