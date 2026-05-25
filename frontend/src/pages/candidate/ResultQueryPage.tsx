import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Spin, Pagination, Empty, Row, Col, Statistic } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import axios from '../api/axios';

interface AdmissionResult {
  id: number;
  application_code: string;
  university_name: string;
  major_name: string;
  status: string;
  result_date?: string;
}

const ResultQueryPage: React.FC = () => {
  const [results, setResults] = useState<AdmissionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ passed: 0, failed: 0, total: 0 });

  useEffect(() => {
    fetchResults();
  }, [page]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/candidate-applications/applications', { 
        params: { 
          page, 
          limit,
          status: 'PASSED,FAILED'
        } 
      });
      setResults(response.data.data);
      setTotal(response.data.pagination.total);
      
      // Calculate stats
      const passed = response.data.data.filter((r: AdmissionResult) => r.status === 'PASSED').length;
      const failed = response.data.data.filter((r: AdmissionResult) => r.status === 'FAILED').length;
      setStats({ passed, failed, total: response.data.pagination.total });
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusMap: Record<string, { label: string; color: string }> = {
    PASSED: { label: 'Đã đỗ', color: 'green' },
    FAILED: { label: 'Không đỗ', color: 'red' },
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
      title: 'Kết quả',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={status === 'PASSED' ? 'success' : 'error'}
          text={statusMap[status]?.label || status}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Tra cứu kết quả xét tuyển" bordered={false}>
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={8}>
            <Statistic title="Tổng số hồ sơ" value={stats.total} />
          </Col>
          <Col span={8}>
            <Statistic 
              title="Đã đỗ" 
              value={stats.passed} 
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={8}>
            <Statistic 
              title="Không đỗ" 
              value={stats.failed}
              valueStyle={{ color: '#f5222d' }}
            />
          </Col>
        </Row>

        {results.length === 0 && !loading ? (
          <Empty description="Chưa có kết quả xét tuyển nào" />
        ) : (
          <>
            <Spin spinning={loading}>
              <Table
                dataSource={results}
                columns={columns}
                rowKey="id"
                pagination={false}
                scroll={{ x: 1000 }}
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
          </>
        )}
      </Card>
    </div>
  );
};

export default ResultQueryPage;
