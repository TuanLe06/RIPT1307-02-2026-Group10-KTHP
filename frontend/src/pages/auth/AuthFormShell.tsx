import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

interface AuthFormShellProps {
  eyebrow: string;
  title: string;
  description: ReactNode;
  children: ReactNode;
  visualIcon: string;
  visualTitle: string;
  visualDescription: string;
  footer?: ReactNode;
}

const authVisualBackgroundStyle = {
  backgroundImage:
    "linear-gradient(135deg, rgba(1, 67, 181, 0.82), rgba(132, 207, 255, 0.58)), url('/auth_bg.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};

const AuthFormShell = ({
  eyebrow,
  title,
  description,
  children,
  visualIcon,
  visualTitle,
  visualDescription,
  footer,
}: AuthFormShellProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid w-full max-w-[980px] overflow-hidden rounded-xxxl border border-hairline-soft bg-surface-container-lowest shadow-[0_22px_70px_rgba(15,23,42,0.12)] lg:grid-cols-2">
          <div className="flex min-h-[600px] items-center justify-center p-5 sm:p-7 lg:p-8">
            <div className="w-full max-w-[430px]">
              <div className="mb-7">
                <p className="mb-2 text-sm font-bold uppercase text-primary">{eyebrow}</p>
                <h1 className="text-[32px] leading-tight font-bold text-text-primary sm:text-[38px]">
                  {title}
                </h1>
                <p className="mt-2 text-[16px] leading-7 text-text-secondary">{description}</p>
              </div>

              {children}

              {footer && (
                <div className="mt-8 text-center text-[16px] leading-7 text-text-secondary">
                  {footer}
                </div>
              )}
            </div>
          </div>

          <div
            className="relative hidden min-h-[600px] flex-col items-center justify-center overflow-hidden bg-primary px-12 py-14 text-center text-white lg:flex"
            style={authVisualBackgroundStyle}
          >
            <img
              alt="AdmisX Brand Mark"
              className="mb-8 h-28 w-28 object-contain"
              src="/logo_3.png"
            />
            <span className="material-symbols-outlined mb-5 text-[42px] text-primary-fixed">
              {visualIcon}
            </span>
            <h2 className="max-w-[420px] text-[46px] leading-tight font-bold">{visualTitle}</h2>
            <p className="mt-5 max-w-[420px] text-[18px] leading-8 opacity-90">
              {visualDescription}
            </p>
            <Link
              className="mt-9 inline-flex h-[52px] min-w-40 items-center justify-center rounded-full border border-white/70 bg-white/10 px-8 text-[16px] font-bold text-white transition-all hover:border-white hover:bg-white hover:text-primary"
              to="/login"
            >
              Đăng nhập
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AuthFormShell;
