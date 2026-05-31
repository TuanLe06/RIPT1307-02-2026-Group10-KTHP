const Footer = () => {
  return (
    <footer className="bg-surface-container-low border-t border-hairline-soft mt-auto pt-xl pb-lg">
      <div className="flex flex-col md:flex-row justify-between items-center py-lg px-6 md:px-8 lg:px-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-md w-full">
          <p className="text-[13px] md:text-[14px] leading-[1.6] text-text-secondary text-center md:text-left">
            &copy; 2024 Cổng tuyển sinh AdmisX. Bảo lưu mọi quyền.
          </p>
          <div className="flex items-center gap-lg">
            <a
              className="text-[13px] md:text-[14px] leading-[1.6] text-text-secondary hover:text-primary transition-colors"
              href="#"
            >
              Chính sách bảo mật
            </a>
            <a
              className="text-[13px] md:text-[14px] leading-[1.6] text-text-secondary hover:text-primary transition-colors"
              href="#"
            >
              Điều khoản
            </a>
            <a
              className="text-[13px] md:text-[14px] leading-[1.6] text-text-secondary hover:text-primary transition-colors"
              href="#"
            >
              Hỗ trợ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
