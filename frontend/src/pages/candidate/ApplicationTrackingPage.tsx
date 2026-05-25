import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Input, Space, Modal, Spin, Pagination, Select, Row, Col } from 'antd';
import { EyeOutlined, DeleteOutlined, SendOutlined } from '@ant-design/icons';
import axios from '../api/axios';

interface Application {
  id: number;
  application_code: string;
  university_name: string;
  major_name: string;
  status: string;
  submitted_at?: string;
  created_at: string;
}

const ApplicationTrackingPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | undefined>();

  const statusMap: Record<string, { label: string; color: string }> = {
    DRAFT: { label: 'Nháp', color: 'default' },
    SUBMITTED: { label: 'Đã nộp', color: 'blue' },
    PENDING_REVIEW: { label: 'Chờ duyệt', color: 'orange' },
    APPROVED: { label: 'Đã duyệt', color: 'green' },
    REJECTED: { label: 'Từ chối', color: 'red' },
    PASSED: { label: 'Đã đỗ', color: 'green' },
    FAILED: { label: 'Không đỗ', color: 'red' },
  };

  useEffect(() => {
    fetchApplications();
  }, [page, filterStatus]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { page, limit };
      if (filterStatus) {
        params.status = filterStatus;
      }
      const response = await axios.get('/candidate-applications/applications', { params });
      setApplications(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (app: Application) => {
    try {
      const response = await axios.get(`/candidate-applications/applications/${app.id}`);
      setSelectedApp(response.data.data);
      setDetailsVisible(true);
    } catch (error) {
      console.error('Error fetching details:', error);
    }
  };

  const handleSubmit = async (appId: number) => {
    try {
      Modal.confirm({
        title: 'Xác nhận nộp hồ sơ',
        content: 'Bạn có chắc chắn muốn nộp hồ sơ này? Hồ sơ đã nộp không thể chỉnh sửa.',
        onOk: async () => {
          await axios.post(`/candidate-applications/applications/${appId}/submit`);
          fetchApplications();
          Modal.success({ content: 'Hồ sơ đã được nộp thành công' });
        },
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      Modal.error({ content: 'Lỗi khi nộp hồ sơ' });
    }
  };

  const handleDelete = async (appId: number) => {
    try {
      Modal.confirm({
        title: 'Xóa hồ sơ',
        content: 'Bạn có chắc chắn muốn xóa hồ sơ này? Thao tác này không thể hoàn tác.',
        onOk: async () => {
          await axios.delete(`/candidate-applications/applications/${appId}`);
          fetchApplications();
          Modal.success({ content: 'Hồ sơ đã được xóa' });
        },
      });
    } catch (error) {
      console.error('Error deleting application:', error);
      Modal.error({ content: 'Lỗi khi xóa hồ sơ' });
    }
  };

  const columns = [
    {
      title: 'Mã hồ sơ',
      dataIndex: 'application_code',
      key: 'application_code',
    },
    {
      title: 'Trường',
      dataIndex: 'university_name',
      key: 'university_name',
    },
    {
      title: 'Ngành',
      dataIndex: 'major_name',
      key: 'major_name',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={statusMap[status]?.color === 'red' ? 'error' : statusMap[status]?.color as any}
          text={statusMap[status]?.label || status}
        />
      ),
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Application) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            Chi tiết
          </Button>
          {record.status === 'DRAFT' && (
            <>
              <Button
                type="primary"
                icon={<SendOutlined />}
                size="small"
                onClick={() => handleSubmit(record.id)}
                style={{ backgroundColor: '#1890ff' }}
              >
                Nộp
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => handleDelete(record.id)}
              >
                Xóa
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Theo dõi trạng thái hồ sơ" bordered={false}>
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={12}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => {
                setFilterStatus(value);
                setPage(1);
              }}
              options={[
                { label: 'Nháp', value: 'DRAFT' },
                { label: 'Đã nộp', value: 'SUBMITTED' },
                { label: 'Chờ duyệt', value: 'PENDING_REVIEW' },
                { label: 'Đã duyệt', value: 'APPROVED' },
                { label: 'Từ chối', value: 'REJECTED' },
                { label: 'Đã đỗ', value: 'PASSED' },
                { label: 'Không đỗ', value: 'FAILED' },
              ]}
            />
          </Col>
        </Row>

        <Spin spinning={loading}>
          <Table
            dataSource={applications}
            columns={columns}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1200 }}
          />
        </Spin>

        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <Pagination
            current={page}
            pageSize={limit}
            total={total}
            onChange={(newPage) => setPage(newPage)}
          />
        </div>
      </Card>

      <Modal
        title="Chi tiết hồ sơ"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={null}
        width={800}
      >
        {selectedApp && (
          <div>
            <p><strong>Mã hồ sơ:</strong> {selectedApp.application_code}</p>
            <p><strong>Trường:</strong> {selectedApp.university_name}</p>
            <p><strong>Ngành:</strong> {selectedApp.major_name}</p>
            <p>
              <strong>Trạng thái:</strong>{' '}
              <Badge
                status={statusMap[selectedApp.status]?.color === 'red' ? 'error' : statusMap[selectedApp.status]?.color as any}
                text={statusMap[selectedApp.status]?.label || selectedApp.status}
              />
            </p>
            {selectedApp.submitted_at && (
              <p><strong>Ngày nộp:</strong> {new Date(selectedApp.submitted_at).toLocaleString('vi-VN')}</p>
            )}
            <p><strong>Ngày tạo:</strong> {new Date(selectedApp.created_at).toLocaleString('vi-VN')}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApplicationTrackingPage;
