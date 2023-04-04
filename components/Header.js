import Link from "next/link";
import { useRouter } from 'next/router'


export default function Header() {

  const router = useRouter()
  const {pathname} = router

  return (
    <header>
      <nav>
        <Link href="/index">index</Link>
        <Link href="/contato">contato</Link>
            <div className="logo-container">
              {pathname === "/" ? (
                <a href="/#homepage"></a>
              ) : (
                // <Link href="/#homepage" passHref legacyBehavior>
                //   <a></a>
                // </Link>
                <Link href="/#homepage"></Link>
              )}
              <img src="/logo.png" alt="Logo Estúdio Lota" />
            </div>
      </nav>
    </header>
  );
}
