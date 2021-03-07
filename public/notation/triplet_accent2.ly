\version "2.20.0"
\paper{
  paper-width =30
  paper-height = 50
}

\book {
  
  \header {
    tagline = ##f
  }

  \score {
  
    <<
         \override Score.BarNumber.break-visibility = ##(#f #f #f)

    \new Staff \with {
      \omit TimeSignature
      \omit BarLine
      \omit Clef
    } 
    {
      \time 1/4
      \override Stem.details.beamed-lengths = #'(4.5)
      \stopStaff
        [r8 e''  ^> ]
    }
 
    >>

  \layout{ 
    indent = 0
    line-width = 50     
  }
  
  \midi{}

  }
}
