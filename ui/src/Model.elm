module Model exposing
    ( Model
    , Page(..)
    , Msg(..)
    , initialModel
    )

import Json.Encode as E
import Time
import Types exposing (..)


type Page
    = LoginPage
    | MainPage


type alias Model =
    { page : Page
    , userId : Maybe String
    , loginForm : LoginForm
    , loginError : Maybe String
    , loginLoading : Bool
    , rooms : List Room
    , selectedRoomId : Maybe String
    , messages : List Message
    , messagesLoading : Bool
    , composeText : String
    , timeZone : Time.Zone
    , switcherOpen : Bool
    , switcherQuery : String
    , switcherIndex : Int
    }


type Msg
    = -- Login form
      SetHomeserver String
    | SetUsername String
    | SetPassword String
    | SubmitLogin
      -- Rooms
    | SelectRoom String
      -- Compose
    | SetComposeText String
    | SubmitMessage
      -- Logout
    | Logout
      -- Port responses (tagged JSON from JS glue)
    | ReceivedFromTauri E.Value
      -- Polling ticks
    | PollRooms
    | PollMessages
      -- DOM effects (fire-and-forget results)
    | DomNoOp
      -- Keyboard
    | KeyPressed String
      -- Reactions
    | SendReaction String String -- eventId emoji
      -- Channel switcher
    | OpenSwitcher
    | CloseSwitcher
    | SetSwitcherQuery String
    | SwitcherUp
    | SwitcherDown
    | SwitcherSelect
      -- Time zone
    | GotTimeZone Time.Zone


initialModel : Model
initialModel =
    { page = LoginPage
    , userId = Nothing
    , loginForm = { homeserver = "", username = "", password = "" }
    , loginError = Nothing
    , loginLoading = False
    , rooms = []
    , selectedRoomId = Nothing
    , messages = []
    , messagesLoading = False
    , composeText = ""
    , timeZone = Time.utc
    , switcherOpen = False
    , switcherQuery = ""
    , switcherIndex = 0
    }
