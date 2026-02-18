module View.Streams exposing (view)

import Html exposing (Html, button, div, pre, span, text)
import Html.Attributes exposing (class, id, title)
import Html.Events exposing (onClick)
import Model exposing (Model, Msg(..))
import Set
import Svg
import Svg.Attributes as SvgA
import Types exposing (StreamButton, StreamLine, StreamState)


view : Model -> Html Msg
view model =
    div [ id "streams-panel" ]
        [ panelHeader model
        , div [ class "streams-list" ]
            (List.map (streamAccordion model.streamsCollapsed) model.streams)
        ]


panelHeader : Model -> Html Msg
panelHeader model =
    let
        activeCount =
            List.filter (\s -> not s.closed) model.streams |> List.length

        label =
            if activeCount > 0 then
                "Streams (" ++ String.fromInt activeCount ++ ")"

            else
                "Streams"
    in
    div [ class "streams-panel-header" ]
        [ span [ class "streams-panel-title" ] [ text label ]
        , button
            [ class "streams-panel-close"
            , onClick ToggleStreamsPanel
            , title "Close panel"
            ]
            [ closeIcon ]
        ]


streamAccordion : Set.Set String -> StreamState -> Html Msg
streamAccordion collapsed stream =
    let
        isCollapsed =
            Set.member stream.streamId collapsed

        statusClass =
            if stream.closed then
                "stream-closed"

            else
                "stream-active"
    in
    div [ class ("stream-accordion " ++ statusClass) ]
        ([ streamHeader stream isCollapsed ]
            ++ (if isCollapsed then
                    []

                else
                    [ streamBody stream ]
               )
        )


streamHeader : StreamState -> Bool -> Html Msg
streamHeader stream isCollapsed =
    div [ class "stream-header", onClick (ToggleStreamCollapsed stream.streamId) ]
        [ span [ class "stream-chevron" ]
            [ text
                (if isCollapsed then
                    ">"

                 else
                    "v"
                )
            ]
        , span [ class "stream-name" ] [ text stream.name ]
        , if stream.closed then
            span [ class "stream-status" ] [ text "done" ]

          else
            text ""
        , div [ class "stream-buttons" ]
            (List.map (streamButton stream.streamId) stream.buttons)
        ]


streamButton : String -> StreamButton -> Html Msg
streamButton streamId btn =
    button
        [ class "stream-action-btn"
        , onClick (StreamButtonClick streamId btn.id)
        , title btn.label
        ]
        [ text btn.label ]


streamBody : StreamState -> Html Msg
streamBody stream =
    pre [ class "stream-output" ]
        (List.map streamLineView stream.lines)


streamLineView : StreamLine -> Html Msg
streamLineView line =
    let
        lineClass =
            if line.channel == "stderr" then
                "stream-line stderr"

            else
                "stream-line"
    in
    span [ class lineClass ] [ text (line.text ++ "\n") ]


closeIcon : Html msg
closeIcon =
    Svg.svg
        [ SvgA.viewBox "0 0 24 24"
        , SvgA.width "14"
        , SvgA.height "14"
        , SvgA.fill "none"
        , SvgA.stroke "currentColor"
        , SvgA.strokeWidth "2"
        , SvgA.strokeLinecap "round"
        , SvgA.strokeLinejoin "round"
        ]
        [ Svg.line [ SvgA.x1 "18", SvgA.y1 "6", SvgA.x2 "6", SvgA.y2 "18" ] []
        , Svg.line [ SvgA.x1 "6", SvgA.y1 "6", SvgA.x2 "18", SvgA.y2 "18" ] []
        ]
