
\version "2.20.0"

\paper{
  paper-width =100
  paper-height = 50
}

\book {

  \header {
    tagline = ##f
  }

  \score {

    <<

      \override Score.BarNumber.break-visibility = ##(#f #f #f)

      \new RhythmicStaff \with {
        \omit TimeSignature
        \omit BarLine
        \omit Clef
        \omit KeySignature
      }

      {
        \time 2/4
        \override TupletBracket.bracket-visibility = ##t
        %S\set tupletFullLength = ##t
       % \override NoteHead.font-size = #-1
        \override Stem.details.beamed-lengths = #'(5.5)
        %\override Stem.details.lengths = #'(5)
        \stopStaff

        \override Beam.grow-direction = #LEFT
        \featherDurations #(ly:make-moment 9/5)
       { c64[ c c c c  ] }
       
      }

    >>

    \layout{
      \context {
        \Score
       %proportionalNotationDuration = #(ly:make-moment 1/128)
       proportionalNotationDuration = #(ly:make-moment 1/100)
        \override SpacingSpanner.uniform-stretching = ##t
        \override SpacingSpanner.strict-note-spacing = ##t
        \override SpacingSpanner.strict-grace-spacing = ##t
        \override Beam.breakable = ##t
        \override Glissando.breakable = ##t
        \override TextSpanner.breakable = ##t
      }

      indent = 0
      line-width = 100
    }

    \midi{}

  }
}
