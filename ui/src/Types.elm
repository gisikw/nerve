module Types exposing
    ( Room
    , Message
    , MessagesResponse
    , Reaction
    , SessionStatus
    , LoginResult
    , LoginForm
    , TypingStatus
    )


type alias Room =
    { id : String
    , name : String
    , isDirect : Bool
    , notificationCount : Int
    , typingUsers : List String
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


type alias MessagesResponse =
    { messages : List Message
    , endToken : Maybe String
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


type alias TypingStatus =
    { users : List String
    }
