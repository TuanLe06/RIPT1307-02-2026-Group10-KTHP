import { Card } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

const Applications = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="shadow-sm rounded-xl text-center max-w-lg">
        <div className="py-8 px-4">
          <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mx-auto mb-5">
            <ClockCircleOutlined className="text-3xl text-primary" />
          </div>
          <h3 className="font-h4-card-header text-h4-card-header text-text-primary mb-2">
            Quản lý Hồ sơ
          </h3>
          <p className="text-text-secondary font-body mb-1">
            Tính năng đang được phát triển.
          </p>
          <p className="text-text-secondary font-body-sm">
            Vui lòng quay lại sau.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Applications;
