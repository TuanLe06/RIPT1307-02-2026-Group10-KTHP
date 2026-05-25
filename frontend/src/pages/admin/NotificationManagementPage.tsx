import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, Space, message, Tabs, Table, Spin } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import axios from '../../api/axios';

interface Notification {
  id: number;
  receiver_email: string;
  subject: string;
  content: string;
  status: string;
  sent_at?: string;
}

const NotificationManagementPage: React.FC = () => {
  const [form] = Form.useForm();
  const [bulkForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleSendManual = async (values: any) => {
    try {
      setLoading(true);
      await axios.post('/admin/notifications/send', values);
      message.success('Thông báo đã được gửi');
      form.resetFields();
    } catch (error) {
      message.error('Lỗi khi gửi thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleSendBulk = async (values: any) => {
    try {
      setLoading(true);
      await axios.post('/admin/notifications/send-bulk', values);
      message.success('Thông báo đã được gửi cho tất cả ứng viên phù hợp');
      bulkForm.resetFields();
    } catch (error) {
      message.error('Lỗi khi gửi thông báo');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Email nhận',
      dataIndex: 'receiver_email',
      key: 'receiver_email',
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, string> = {
          PENDING: 'Chưa gửi',
          SENT: 'Đã gửi',
          FAILED: 'Lỗi',
        };
        return statusMap[status] || status;
      },
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'sent_at',
      key: 'sent_at',
      render: (date: string) => date ? new Date(date).toLocaleString('vi-VN') : '-',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Tabs
        items={[
          {
            key: '1',
            label: 'Gửi thông báo từng ứng viên',
            children: (
              <Card bordered={false}>
                <Form
                  form={form}
                  onFinish={handleSendManual}
                  layout="vertical"
                  style={{ maxWidth: '600px' }}
                >
                  <Form.Item 
                    name="receiver_id" 
                    label="ID ứng viên" 
                    rules={[{ required: true, message: 'Vui lòng nhập ID ứng viên' }]}
                  >
                    <Input type="number" />
                  </Form.Item>

                  <Form.Item 
                    name="receiver_email" 
                    label="Email" 
                    rules={[
                      { required: true, message: 'Vui lòng nhập email' },
                      { type: 'email', message: 'Email không hợp lệ' },
                    ]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item 
                    name="subject" 
                    label="Tiêu đề" 
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item 
                    name="content" 
                    label="Nội dung" 
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                  >
                    <Input.TextArea rows={6} />
                  </Form.Item>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      icon={<SendOutlined />}
                      htmlType="submit"
                      loading={loading}
                    >
                      Gửi
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            ),
          },
          {
            key: '2',
            label: 'Gửi thông báo hàng loạt',
            children: (
              <Card bordered={false}>
                <Form
                  form={bulkForm}
                  onFinish={handleSendBulk}
                  layout="vertical"
                  style={{ maxWidth: '600px' }}
                >
                  <Form.Item 
                    name="university_id" 
                    label="Trường (tùy chọn)"
                  >
                    <Input type="number" placeholder="Để trống để chọn tất cả" />
                  </Form.Item>

                  <Form.Item 
                    name="major_id" 
                    label="Ngành (tùy chọn)"
                  >
                    <Input type="number" placeholder="Để trống để chọn tất cả" />
                  </Form.Item>

                  <Form.Item 
                    name="status" 
                    label="Trạng thái (tùy chọn)"
                  >
                    <Select
                      placeholder="Để trống để chọn tất cả"
                      allowClear
                      options={[
                        { label: 'Đã nộp', value: 'SUBMITTED' },
                        { label: 'Chờ duyệt', value: 'PENDING_REVIEW' },
                        { label: 'Đã duyệt', value: 'APPROVED' },
                        { label: 'Từ chối', value: 'REJECTED' },
                        { label: 'Đã đỗ', value: 'PASSED' },
                        { label: 'Không đỗ', value: 'FAILED' },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item 
                    name="subject" 
                    label="Tiêu đề" 
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item 
                    name="content" 
                    label="Nội dung" 
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                  >
                    <Input.TextArea rows={6} />
                  </Form.Item>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      icon={<SendOutlined />}
                      htmlType="submit"
                      loading={loading}
                    >
                      Gửi cho tất cả ứng viên phù hợp
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default NotificationManagementPage;
