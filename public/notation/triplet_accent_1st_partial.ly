\version "2.18.2"

\paper{
  paper-width =50
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
        \time 1/4
        \override TupletBracket.bracket-visibility = ##t
        %S\set tupletFullLength = ##t
        %\override NoteHead.font-size = #-1
       % \override Stem.details.beamed-lengths = #'(5)
       % \override Stem.details.lengths = #'(5)
              \stopStaff

        %\once \override TupletNumber #'text = "7:4"
        \tuplet 3/2 {e''8 -> e'' e''}
      }

    >>

    \layout{
      \context {
        \Score
        %proportionalNotationDuration = #(ly:make-moment 1/128)
        \override SpacingSpanner.uniform-stretching = ##t
        \override SpacingSpanner.strict-note-spacing = ##t
        \override SpacingSpanner.strict-grace-spacing = ##t
        \override Beam.breakable = ##t
        \override Glissando.breakable = ##t
        \override TextSpanner.breakable = ##t
      }

      indent = 0
      line-width = 50
    }

    \midi{}

  }
}
