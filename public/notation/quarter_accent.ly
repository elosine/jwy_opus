\version "2.20.0"
\paper{
  paper-width =25
  paper-height = 50
}

\book {
  
  \header {
    tagline = ##f
  }

  \score {
  
    <<
      
    \new Staff \with {
      \omit TimeSignature
      \omit BarLine
      \omit Clef
    } 
    {
      \time 1/4
     % \override Stem.length = #0
      \stopStaff
        e''4  ^> 
    }
 
    >>

  \layout{ 
    indent = 0
    line-width = 50     
  }
  
  \midi{}

  }
}
