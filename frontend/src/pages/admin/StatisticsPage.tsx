import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Table, Spin, message, Tabs } from 'antd';
import axios from '../../api/axios';

interface UniversityStat {
  id: number;
  code: string;
  name: string;
  total_applications: number;
  submitted: number;
  pending_review: number;
  approved: number;
  rejected: number;
  passed: number;
  failed: number;
}

interface MajorStat {
  id: number;
  code: string;
  name: string;
  university_name: string;
  total_applications: number;
  submitted: number;
  pending_review: number;
  approved: number;
  rejected: number;
  passed: number;
  failed: number;
}

interface StatusStat {
  status: string;
  count: number;
  percentage: number;
}

interface OverallStats {
  total_applications: number;
  status_statistics: {
    total: number;
    submitted: number;
    pending_review: number;
    approved: number;
    rejected: number;
    passed: number;
    failed: number;
  };
  total_universities: number;
  total_majors: number;
  total_candidates: number;
}

const StatisticsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [universityStats, setUniversityStats] = useState<UniversityStat[]>([]);
  const [majorStats, setMajorStats] = useState<MajorStat[]>([]);
  const [statusStats, setStatusStats] = useState<StatusStat[]>([]);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      const [overall, university, major, status] = await Promise.all([
        axios.get('/admin/reports/statistics/overall'),
        axios.get('/admin/reports/statistics/by-university'),
        axios.get('/admin/reports/statistics/by-major'),
        axios.get('/admin/reports/statistics/by-status'),
      ]);

      setOverallStats(overall.data.data);
      setUniversityStats(university.data.data);
      setMajorStats(major.data.data);
      setStatusStats(status.data.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      message.error('Lỗi khi tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  const universityColumns = [
    { title: 'Mã', dataIndex: 'code', key: 'code' },
    { title: 'Tên trường', dataIndex: 'name', key: 'name' },
    { title: 'Tổng hồ sơ', dataIndex: 'total_applications', key: 'total_applications' },
    { title: 'Đã nộp', dataIndex: 'submitted', key: 'submitted' },
    { title: 'Chờ duyệt', dataIndex: 'pending_review', key: 'pending_review' },
    { title: 'Đã duyệt', dataIndex: 'approved', key: 'approved' },
    { title: 'Từ chối', dataIndex: 'rejected', key: 'rejected' },
    { title: 'Đã đỗ', dataIndex: 'passed', key: 'passed' },
    { title: 'Không đỗ', dataIndex: 'failed', key: 'failed' },
  ];

  const majorColumns = [
    { title: 'Mã', dataIndex: 'code', key: 'code' },
    { title: 'Tên ngành', dataIndex: 'name', key: 'name' },
    { title: 'Trường', dataIndex: 'university_name', key: 'university_name' },
    { title: 'Tổng hồ sơ', dataIndex: 'total_applications', key: 'total_applications' },
    { title: 'Đã nộp', dataIndex: 'submitted', key: 'submitted' },
    { title: 'Chờ duyệt', dataIndex: 'pending_review', key: 'pending_review' },
    { title: 'Đã duyệt', dataIndex: 'approved', key: 'approved' },
    { title: 'Từ chối', dataIndex: 'rejected', key: 'rejected' },
    { title: 'Đã đỗ', dataIndex: 'passed', key: 'passed' },
    { title: 'Không đỗ', dataIndex: 'failed', key: 'failed' },
  ];

  const statusColumns = [
    { title: 'Trạng thái', dataIndex: 'status_display', key: 'status' },
    { title: 'Số lượng', dataIndex: 'count', key: 'count' },
    { title: 'Tỷ lệ (%)', dataIndex: 'percentage', key: 'percentage' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Spin spinning={loading}>
        {/* Overall Statistics */}
        {overallStats && (
          <Card title="Tổng quan" bordered={false} style={{ marginBottom: '24px' }}>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic title="Tổng hồ sơ" value={overallStats.total_applications} />
              </Col>
              <Col span={6}>
                <Statistic title="Tổng trường" value={overallStats.total_universities} />
              </Col>
              <Col span={6}>
                <Statistic title="Tổng ngành" value={overallStats.total_majors} />
              </Col>
              <Col span={6}>
                <Statistic title="Tổng ứng viên" value={overallStats.total_candidates} />
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: '16px' }}>
              <Col span={4}>
                <Statistic 
                  title="Đã nộp" 
                  value={overallStats.status_statistics.submitted}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Chờ duyệt" 
                  value={overallStats.status_statistics.pending_review}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Đã duyệt" 
                  value={overallStats.status_statistics.approved}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Từ chối" 
                  value={overallStats.status_statistics.rejected}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Đã đỗ" 
                  value={overallStats.status_statistics.passed}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={4}>
                <Statistic 
                  title="Không đỗ" 
                  value={overallStats.status_statistics.failed}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Col>
            </Row>
          </Card>
        )}

        {/* Tabs for detailed statistics */}
        <Tabs
          items={[
            {
              key: '1',
              label: 'Thống kê theo Trường',
              children: (
                <Card bordered={false}>
                  <Table
                    dataSource={universityStats}
                    columns={universityColumns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1400 }}
                  />
                </Card>
              ),
            },
            {
              key: '2',
              label: 'Thống kê theo Ngành',
              children: (
                <Card bordered={false}>
                  <Table
                    dataSource={majorStats}
                    columns={majorColumns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1600 }}
                  />
                </Card>
              ),
            },
            {
              key: '3',
              label: 'Thống kê theo Trạng thái',
              children: (
                <Card bordered={false}>
                  <Table
                    dataSource={statusStats}
                    columns={statusColumns}
                    rowKey="status"
                    pagination={false}
                  />
                </Card>
              ),
            },
          ]}
        />
      </Spin>
    </div>
  );
};

export default StatisticsPage;
