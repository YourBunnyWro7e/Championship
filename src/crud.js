import React from 'react';
import './Styles/Main.css';

import {reactSelectStyles} from './Styles/react-select';
import Select from 'react-select';
import axios from "axios";

export default class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      operations: [{label: "Create", value: "Create"}, {label: "Read", value: "Read"},
        {label: "Update", value: "Update"}, {label: "Delete", value: "Delete"}],
      selectedOperation: null,

      tables: [],
      selectedTable: null,

      fields: [],
      idKeys: [],
      selectedField: null,
    };
  }

  componentDidMount() {
    this.setState({selectedOperation: this.state.operations[0]});

    axios.get("/api/collections", {}).then((res) => {
      this.setState({
        tables: res.data.map((item) => {
          return {label: item, value: item}
        })
      });
      console.log(res)
    }).catch((err) => console.log(err))
  }

  configureFieldsSelect = async () => {
    if (this.state.selectedOperation) {
      let fields = [], idKeys = [], keysNames = [];
      await axios.get("/api/collections/metadata", {params: {table: this.state.selectedTable.value}})
        .then((res) => {
          console.log(res);

          res.data.map((item) => {
            if (typeof item === "string") {
              fields = fields.concat({label: item, value: item});
            } else {
              item.map((selects, i) => {
                keysNames.push([selects]);
                selects[Object.keys(selects)[0]].map((object) => {
                  idKeys[i] = idKeys.concat({label: object._id, value: object._id})
                });
              })
            }
          });
          return false;
        }).catch((err) => console.log(err));

      this.setState(
        {fields: fields, idKeys: idKeys, keysNames: keysNames}
      )
    }
  };

  crudDynamically = (event) => {
    event.preventDefault();
    const {selectedTable, selectedOperation, operations, fields} = this.state;
    //Create
    if (selectedTable && selectedOperation === operations[0]) {
      let payload = {};
      fields.forEach((item, i) => {
        console.log(event.target.elements['textInput' + i].value);
        payload[item.value] = event.target.elements['textInput' + i].value
      });
      console.log(payload);

      axios.post("/api/collections/", payload, {params: {table: selectedTable.value}}).then((res) => {
        console.log(res)
      }).catch((err) => console.log(err))
      //Read
    } else if (selectedTable && selectedOperation === operations[1]) {

      console.log(event.target.value);

      axios.get("/api/collections/extract", {params: {table: selectedTable.value}}).then((res) => {
        console.log(res)
      }).catch((err) => console.log(err))
    }
  };

  render() {
    return (
      <div className="column">

        <div className="row">CRUD</div>

        <form className="row" onSubmit={(e) => {
        }}>
          <div>
            <div> Select operation</div>
            <Select
              value={this.state.selectedOperation}
              onChange={async (selected) => {
                await this.setState({
                  selectedOperation: selected,
                });
              }}
              options={this.state.operations}
              styles={reactSelectStyles}/>
          </div>

          <div>
            <div> Select table</div>
            <Select
              onChange={async (selected) => {
                await this.setState({selectedTable: selected});
                this.configureFieldsSelect()
              }}
              options={this.state.tables}
              styles={reactSelectStyles}
            />
          </div>


          {this.state.selectedTable && this.state.selectedOperation === this.state.operations[0] ?
            <div className="column">
              {this.state.idKeys.map((field, i) => {
                return <Select
                  key={i}
                  name={"textInput" + i + this.state.fields.length}
                 // options={this.state.idKeys[i]}
                  styles={reactSelectStyles}
               // placeholder={this.state.keysNames[i]}
                />
              })}
              {this.state.fields.map((field, i) => {
                return <div key={i}>
                  <div>
                    {field.value}
                  </div>
                  <input required name={"textInput" + i} className="input"/>
                </div>
              })}
            </div>
            :
            this.state.selectedTable ?
              <Select
                onChange={(selected) => this.setState({
                  selectedField: selected,
                })}
                options={this.state.fields}
                styles={reactSelectStyles}/> : null
          }

          {this.state.selectedTable && this.state.selectedOperation === this.state.operations[2] ?
            <input className="input" placeholder="Enter new data..."/> : null}

          <button className="button" type="submit">Apply</button>

        </form>
      </div>
    )
  }
}
//delete and read однакові

