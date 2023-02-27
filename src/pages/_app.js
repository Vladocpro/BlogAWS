// import '@/styles/globals.css'
import '../../configureAmplify'
import 'tailwindcss/tailwind.css';
import Navbar from "./components/navbar";

export default function App({ Component, pageProps }) {
  return (
      <div>
        <Navbar/>
        <div className="py-8 px-16 bg-slate-100">
          <Component {...pageProps} />
        </div>
      </div>
)
}

