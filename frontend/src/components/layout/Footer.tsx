const footerLinks = [
  { label: "Chính sách bảo mật", href: "#" },
  { label: "Điều khoản sử dụng", href: "#" },
  { label: "Hỗ trợ thí sinh", href: "#" },
];

const supportItems = [
  { icon: "mail", label: "support@admisx.edu.vn" },
  { icon: "schedule", label: "Thứ 2 - Thứ 6, 08:00 - 17:00" },
];

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-hairline-soft bg-surface-container-low dark:bg-surface-dim">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-6 py-8 md:px-8 lg:px-10">
        <div className="grid gap-8 md:grid-cols-[1.4fr_0.9fr_1fr] md:items-start">
          <div className="max-w-[420px]">
            <div className="mb-3 flex items-center gap-3">
              <img
                alt="AdmisX Logo"
                className="h-9 w-9 object-contain"
                src="/logo_3.png"
              />
              <span className="text-[20px] font-black leading-none text-text-primary">
                AdmisX
              </span>
            </div>
            <p className="text-[14px] leading-[1.7] text-text-secondary">
              Cổng tuyển sinh giúp thí sinh theo dõi hồ sơ, cập nhật trạng thái
              xét tuyển và nhận thông báo từ nhà trường rõ ràng hơn.
            </p>
          </div>

          <nav aria-label="Liên kết footer">
            <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[0.08em] text-text-primary">
              Liên kết
            </h2>
            <div className="flex flex-col gap-2.5">
              {footerLinks.map((link) => (
                <a
                  key={link.label}
                  className="text-[14px] leading-[1.5] text-text-secondary transition-colors hover:text-primary"
                  href={link.href}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </nav>

          <div>
            <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[0.08em] text-text-primary">
              Hỗ trợ
            </h2>
            <div className="flex flex-col gap-3">
              {supportItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-2.5 text-[14px] leading-[1.55] text-text-secondary"
                >
                  <span className="material-symbols-outlined mt-0.5 text-[18px] text-primary">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-hairline-soft pt-5 text-[13px] leading-[1.6] text-text-secondary md:flex-row md:items-center md:justify-between">
          <p>&copy; 2026 Cổng tuyển sinh AdmisX. Bảo lưu mọi quyền.</p>
          <p className="text-text-secondary">
            Đồng hành cùng hành trình xét tuyển đại học của cậu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
