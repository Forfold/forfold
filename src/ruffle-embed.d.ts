import 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ruffle-embed': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
    }
  }
}
