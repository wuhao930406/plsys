import React, { Component } from 'react';
import moment from 'moment';
import {
  Card, Button, Row, Col, Drawer, Tabs, Tag,
  Select, Divider, TreeSelect, Empty, Table
} from 'antd';
import { connect } from 'dva';
import styles from './style.less';
import ReactEcharts from "echarts-for-react";
const { TreeNode } = TreeSelect;
const Option = Select.Option;
const { TabPane } = Tabs;
const { CheckableTag } = Tag;
const tagsFromServer = ['日', '周', '月', '季', '半年', '年'];

class ChartChild extends Component {
  constructor(props) {
    super(props)
    this.state = {
      postData: {
        companyId: "",
        unit: ""
      }
    }
  }

  getOption(itemz) {
    let allData = itemz;
    let res = {}
    let xData = allData ? allData.map((item, i) => {
      return this.props.keys == "0" ? item.equipmentModel : item.faultTypeName
    }) : null,
      repairCount = allData.map((item, i) => {
        return item.repairCount
      }),
      totalRepairRate = allData.map((item, i) => {
        return item.totalRepairRate
      }),
      legend = this.props.keys == "0" ? ['维修次数', '故障占比(%)'] : ["故障次数", "故障占比(%)"]

    res = {
      title: {
        text: itemz.key,
        subtext: '',
        x: '0',
        textStyle: {
          fontSize: 16,
          fontWeight: "noraml",
          color: "#f50"
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        }
      },
      dataZoom: [{
        type: 'inside'
      }, {
        type: 'slider'
      }],
      toolbox: {
        feature: {
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ['line', 'bar'] },
          restore: { show: true },
          saveAsImage: { show: false }
        }
      },
      legend: {
        data: legend,
        left: "center",
      },
      xAxis: [
        {
          type: 'category',
          data: xData,
          axisPointer: {
            type: 'shadow'
          },
          axisLabel: {
            interval:0,  
            rotate:40 
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: this.props.keys == "0" ? "维修次数" : "故障次数",
          min: 0,
          max: Math.max.apply(null, repairCount),
          axisLabel: {
            formatter: '{value}'
          }
        }, {
          type: 'value',
          scale: true,
          name: this.props.keys == "0" ? "故障占比(%)" : "故障占比(%)",
          max: 100,
          min: 0,
          axisLabel: {
            formatter: '{value}%'
          }
        }
      ],
      series: [
        {
          name: this.props.keys == "0" ? "维修次数" : "故障次数",
          type: 'bar',
          data: repairCount,
          itemStyle: {
            normal: {
              color: "#405d97"
            }
          },
          label: {
            normal: {
              formatter: '{c}',
              show: true
            },
          },
        },
        {
          name: this.props.keys == "0" ? "故障占比(%)" : "故障占比(%)",
          type: 'line',
          yAxisIndex: 1,
          data: totalRepairRate,
          itemStyle: {
            normal: {
              color: "#f2637b"
            }
          },
          label: {
            normal: {
              formatter: '{c}%',
              show: true
            },
          },
        }
      ]
    }
    return res

  }

  render() {
    let { data, keys, companyList, postData, postDatas, ifs } = this.props;
    let colc = {
      xs: 24, sm: 24, md: 24, lg: 12, xl: 12, xxl: 12
    }
    return <div>
      {
        data && data.length > 0 ?
          <Row gutter={12}>
            <Col {...colc}>
              <Table bordered
                pagination={false}
                columns={keys == "0" ? [
                  {
                    title: '设备型号',
                    dataIndex: 'equipmentModel',
                    key: 'equipmentModel',
                  },
                  {
                    title: '维修次数',
                    dataIndex: 'repairCount',
                    key: 'repairCount',
                  },
                  {
                    title: '累计维修次数',
                    dataIndex: 'totalRepairCount',
                    key: 'totalRepairCount',
                  },
                  {
                    title: '故障占比(%)',
                    dataIndex: 'totalRepairRate',
                    key: 'totalRepairRate',
                  },
                ] : [
                    {
                      title: '故障名称',
                      dataIndex: 'faultTypeName',
                      key: 'faultTypeName',
                    },
                    {
                      title: '故障次数',
                      dataIndex: 'repairCount',
                      key: 'repairCount',
                    },
                    {
                      title: '累计故障次数',
                      dataIndex: 'totalRepairCount',
                      key: 'totalRepairCount',
                    },
                    {
                      title: '故障占比(%)',
                      dataIndex: 'totalRepairRate',
                      key: 'totalRepairRate',
                    },
                  ]}
                dataSource={data}
              />
            </Col>
            <Col {...colc}>
              <ReactEcharts style={{ height: 500, marginTop: 12 }} option={this.getOption(data)}></ReactEcharts>
              {
                ifs == "0" ? null :
                  keys == "0" && postData.companyId ?
                    <Button style={{ width: "90%", margin: "12px auto 0 auto", display: "block" }} type='danger' onClick={() => {
                      this.props.change();
                    }}>查看各产品线详情</Button>
                    :
                    keys == "1" && postDatas.companyId ?
                      <Button style={{ width: "90%", margin: "12px auto 0 auto", display: "block" }} type='danger' onClick={() => {
                        this.props.change()
                      }}>查看各产品线详情</Button>
                      :
                      null
              }
            </Col>
          </Row>
          : <Empty style={{ marginTop: 18 }}></Empty>
      }
    </div>
  }


}


//queryTypeFault,queryTypeFaultByCompanyId,queryFaultTypeFault,queryFaultTypeFaultByCompanyId
@connect(({ chart, loading }) => ({
  chart,
  submitting: loading.effects['chart/queryTypeFault'],
}))
class ChartFault extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      key: "0",
      postData: {
        "companyId": '',//公司id
        "unit": ['']
      },
      postDatas: {
        "companyId": '',//公司id
        "unit": ['']
      },
      postDataz: {
        "companyId": '',//公司id
        "unit": ['']
      }
    };
  }

  /* dispatch获取/设置 */
  setNewState(type, value, fn) {
    let { dispatch, chart } = this.props;
    dispatch({
      type: 'chart/' + type,
      payload: value,
    }).then(key => {
      if (key) {
        fn ? fn(key) : null;
      }
    });
  }

  resetData(url, postData) {
    let post = JSON.parse(JSON.stringify(this.state[postData]));
    post.unit = post.unit[0];
    this.setNewState(url, post);
  }

  componentDidMount() {
    this.resetData('queryTypeFault', 'postData')
  }


  handleChange(tag, checked) {
    let { key } = this.state;
    const post = key == "0" ? this.state.postData : this.state.postDatas;
    const postName = key == "0" ? "postData" : "postDatas";
    const url = key == "0" ? "queryTypeFault" : "queryFaultTypeFault";
    const { unit } = post;
    const nextSelectedTags = checked ? [tag] : [];
    this.setState({
      [postName]: {
        ...post,
        unit: nextSelectedTags
      }
    }, () => {
      this.resetData(url, postName)
    });
  }

  handleChanges(tag, checked) {
    let { key } = this.state;
    const nextSelectedTags = checked ? [tag] : [];
    const post = key == "0" ? this.state.postData : this.state.postDatas;
    const url = key == "0" ? "queryTypeFaultByCompanyId" : "queryFaultTypeFaultByCompanyId";
    this.setState({
      postDataz: {
        companyId: post.companyId,
        unit: nextSelectedTags
      }
    }, () => {
      this.setNewState(url, {
        companyId: post.companyId,
        unit: nextSelectedTags ? nextSelectedTags[0] : ""
      })
    })

  }

  getTitle = () => {
    let { postData, postDatas } = this.state, { companyList } = this.props.chart;
    if (this.state.key == "0") {
      return companyList.filter((item) => { return item.id == postData.companyId })[0].companyName
    } else {
      return companyList.filter((item) => { return item.id == postDatas.companyId })[0].companyName
    }

  }

  change = () => {
    let { key } = this.state;
    const post = key == "0" ? this.state.postData : this.state.postDatas;
    const url = key == "0" ? "queryTypeFaultByCompanyId" : "queryFaultTypeFaultByCompanyId"
    this.setNewState(url, {
      companyId: post.companyId,
      unit: post.unit[0] ? post.unit[0] : ''
    }, () => {
      this.setState({
        visible: true,
        title: this.getTitle(),
        postDataz: {
          companyId: post.companyId,
          unit: post.unit[0]
        }
      })
    })
  }



  render() {
    const { postData, postDatas, key, visible, title, postDataz } = this.state,
      { queryTypeFault, companyList, queryFaultTypeFault, queryTypeFaultByCompanyId, queryFaultTypeFaultByCompanyId } = this.props.chart;

    let callback = (key) => {
      this.setState({ key })
    }


    return (
      <div>
        <Drawer
          width={"96%"}
          visible={visible}
          title={title ? title : "详情"}
          onClose={() => {
            this.setState({
              visible: false
            })
          }}
        >
          <span style={{ paddingRight: 6 }}>
            筛选 ：
          </span>
          {
            tagsFromServer.map(tag => (
              <CheckableTag
                style={{cursor:"pointer"}}
                key={tag}
                checked={postDataz.unit.indexOf(tag) > -1}
                onChange={checked => this.handleChanges(tag, checked)}
              >
                {tag}
              </CheckableTag>
            ))
          }
          <Divider></Divider>
          {
            key == "0" ?
              queryTypeFaultByCompanyId.map((item, i) => {
                return <Card key={i} title={item.key} style={{ marginBottom: 12 }}>
                  <ChartChild data={item.value} keys={key} ifs={"0"}>
                  </ChartChild>
                </Card>
              })
              : queryFaultTypeFaultByCompanyId.map((item, i) => {
                return <Card key={i} title={item.key} style={{ marginBottom: 12 }}>
                  <ChartChild data={item.value} keys={key} ifs={"0"}>
                  </ChartChild>
                </Card>
              })


          }
        </Drawer>
        <div className={styles.container}>
          <Card title="故障分析" extra={tagsFromServer.map(tag => (
            <CheckableTag
              style={{cursor:"pointer"}}
              key={tag}
              checked={key == "0" ? postData.unit.indexOf(tag) > -1 : postDatas.unit.indexOf(tag) > -1}
              onChange={checked => this.handleChange(tag, checked)}
            >
              {tag}
            </CheckableTag>
          ))}>
            <Row style={{ backgroundColor: '#ffffff', marginBottom: 12 }}>
              <Col style={{ marginBottom: 12 }}>
                <Select style={{ width: "100%" }} placeholder="选择组织" allowClear
                  value={key == "0" ? postData.companyId : postDatas.companyId} onChange={(value) => {
                    const post = key == "0" ? this.state.postData : this.state.postDatas;
                    const postName = key == "0" ? "postData" : "postDatas";
                    const url = key == "0" ? "queryTypeFault" : "queryFaultTypeFault"
                    this.setState({
                      [postName]: {
                        ...post,
                        companyId: value
                      }
                    }, () => {
                      this.resetData(url, postName)
                    })
                  }}>
                  {
                    companyList.map((item, i) => {
                      return <Option key={i} value={item.id}>{item.companyName}</Option>
                    })
                  }
                </Select>

              </Col>
            </Row>
            <Row>
              <Tabs defaultActiveKey="0" onChange={callback} style={{ marginTop: -12 }}>
                <TabPane tab="设备型号维修分析" key="0">
                  {
                    this.state.key == "0" &&
                    <ChartChild change={this.change} keys={"0"} data={queryTypeFault} ifs={1} postData={postData} postDatas={postDatas} companyList={companyList}></ChartChild>
                  }
                </TabPane>
                <TabPane tab="故障类型故障分析" key="1">
                  {
                    this.state.key == "1" &&
                    <ChartChild change={this.change} keys={"1"} data={queryFaultTypeFault} ifs={1} postData={postData} postDatas={postDatas} companyList={companyList}></ChartChild>
                  }
                </TabPane>
              </Tabs>

            </Row>

          </Card>

        </div>

      </div>
    );
  }
}


export default ChartFault;
