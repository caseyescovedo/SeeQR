import React, { Component } from 'react';
import { Compare } from './leftPanel/Compare';
import History from './leftPanel/History';
// import { SchemaContainer } from './rightPanel/SchemaContainer';
import { Tabs } from './rightPanel/Tabs';

const { ipcRenderer } = window.require('electron');
type MainState = {
  // queries: {
  //   queryString: string;
  //   queryData: string;
  //   queryStatistics: any
  //   querySchema: string;
  // }[];
  queries: any;
  currentSchema: string;
  // queryLabel: string;
  dbLists: any;
  helloworld: string;
};

type MainProps = {};
class MainPanel extends Component<MainProps, MainState> {
  constructor(props: MainProps) {
    super(props);
    this.onClickTabItem = this.onClickTabItem.bind(this);
  }
  state: MainState = {
    queries: [],
    // currentSchema will change depending on which Schema Tab user selects
    currentSchema: 'defaultDB',
    helloworld: '',
    dbLists: {
      databaseList: ['defaultDB'],
      tableList: [],
    }
  };

  componentDidMount() {
    // ipcRenderer.on('db-lists', (event: any, listObj: any) => {
    //   console.log('db_name', db_name);
    //   this.setState()
    // })

    // Listening for returnedData from executing Query
    // Update state with new object (containing query data, query statistics, query schema
    // inside of state.queries array
    ipcRenderer.on('return-execute-query', (event: any, returnedData: any) => {
      console.log('returnedData', returnedData);
      // destructure from returnedData from backend
      const { queryString, queryData, queryStatistics, queryCurrentSchema, queryLabel } = returnedData;
      // create new query object with returnedData
      const newQuery = {
        queryString,
        queryData,
        queryStatistics,
        querySchema: queryCurrentSchema,
        queryLabel,
      }
      // create copy of current queries array
      let queries = this.state.queries.slice();
      // push new query object into copy of queries array
      queries.push(newQuery)
      this.setState({ queries })
    });

    ipcRenderer.on('db-lists', (event: any, returnedLists: any) => {
      this.setState({ dbLists: returnedLists })
      console.log('DB LIST CHECK !', this.state.dbLists);
    })
  }

  onClickTabItem(tabName) {
    ipcRenderer.send('change-db', tabName);
    ipcRenderer.on('return-change-db', (event: any, db_name: string) => {
      this.setState({ currentSchema: tabName });
    });
  }

  render() {
    return (
      <div id="main-panel">
        <div id="main-left">
          <History queries={this.state.queries} currentSchema={this.state.currentSchema} />
          <Compare queries={this.state.queries} currentSchema={this.state.currentSchema} />
        </div>
        <Tabs activeTab={this.state.currentSchema} tabList={this.state.dbLists.databaseList} queries={this.state.queries} onClickTabItem={this.onClickTabItem} />
        {/* <SchemaContainer queries={this.state.queries} currentSchema={this.state.currentSchema} /> */}
      </div>
    );
  }
}
export default MainPanel;
