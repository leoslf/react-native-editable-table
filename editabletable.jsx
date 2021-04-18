import _ from 'lodash';

import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import PropTypes from 'prop-types';
import Style from './style';

import Column from './lib/Column';
import Cell from './lib/Cell';

class EditableTable extends React.Component{

  constructor(props){
    super(props);

    // append empty rows at the end
    if (props.emptyRows) {
      const emptyCol = { value: '', editable: true };
      for (let i = 0; i < props.emptyRows; i++) {
        const emptyRow = new Array(this.props.columns.length).fill({...emptyCol});
        this.props.values.push(emptyRow);
      }
    }

    const sortIndex = props.columns.findIndex((column) => 'defaultSort' in column);
    const columnWidths = props.columns.map((column) => column.width);

    this.state = {
      sort: sortIndex !== -1 ? props.columns[sortIndex].defaultSort : null,
      sortColumnIndex: sortIndex !== -1 ? sortIndex : null,
      rows: props.values.length,
      widths: this._calculateCellWidths(columnWidths),
    };
  }

  createColumns(columns) {
    return columns.map((column, i) => {
      return (
        <Column
          {...column}
          key={column.key}
          column={column}
          index={i}
          customStyles={this.props.customStyles}
          borderStyle={
            this.props.headerBorders
              ? this._createBorderStyles(i, columns.length)
              : {}
          }
          onColumnChange={this.props.onColumnChange}
          height={this.props.cellHeight}
          width={this.state.widths[i]}
          onPress={this.handleColumnClick.bind(this)}
        />
      );
    });
  }

  createRows(rows) {
    return rows.map((row, i) => {
      const isLastRow = rows.length - 1 === i;
      const rowStyle = [
        Style.row,
        this.props.customStyles.row,
        (isLastRow ? {borderBottomWidth: 0} : {})
      ];
      return (
        <View key={i} style={rowStyle}>
          {this.createRow(row, i)}
        </View>
      );
    });
  }

  createRow(row, rowIndex) {
    let addColIndex = 0;
    if (_.isObject(row)) {
      row = _.keys(this.columns).map((key) => row[key]);
    }
    return row.map((cell, colIndex) => {
      colIndex = colIndex + addColIndex;
      if (_.isObject(cell) && 'span' in cell) {
        addColIndex += cell.span - 1;
      }
      let borderStyle = {};
      if (this.props.borders) {
        borderStyle = this._createBorderStyles(colIndex, row.length);
      }
      return this.createCell(cell, colIndex, rowIndex, borderStyle);
    });
  }

  createCell(cell, colIndex, rowIndex, borderStyle) {
    const columnInput = `${this.props.columns[colIndex].key}-${rowIndex}-${colIndex}`;
    return (
      <Cell
        value={cell}
        editable={this.props.columns[colIndex].editable}
        key={colIndex}
        borderStyle={borderStyle}
        customStyles={this.props.customStyles}
        height={this.props.cellHeight}
        width={this.state.widths[colIndex]}
        input={columnInput}
        index={colIndex}
        column={colIndex}
        row={rowIndex}
        onCellChange={this.props.onCellChange}
      />
    );
  }

  _createBorderStyles(i, length) {
    return {
      borderRightWidth: (length - 1 > i ? 0.5 : 0)
    };
  }

  _calculateCellWidths(widths) {
    const widthFlexs = [];
    for (let i = 0; i < widths.length; i++) {
      widthFlexs.push(widths.length * (widths[i] * 0.01));
    }
    return widthFlexs;
  }

  get columns() {
    return _.fromPairs(this.props.columns.map(({ key, value }) => [key, value]));
  }

  render() {
    const {
      style,
      customStyles,
      cellHeight,
      columns,
      values
    } = this.props;

    return (
      <View style={[Style.container, style, {minHeight: cellHeight}]}>
        <ScrollView style={{flex: 1}}>
          <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'position' : 'padding'} enabled>
            <View style={{flex: 1, flexDirection: 'column'}}>
              <View style={[Style.row, customStyles.row]}>
                {this.createColumns(columns)}
              </View>
              {this.createRows(values)}
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
      </View>
    );
  }

  handleColumnClick(e) {
    console.log(e);
    const { values } = this.state;
    // this.setState({ values: _.sortBy(values, column) });
  }
}

EditableTable.defaultProps = {
  values: [],
  emptyRows: 0,
  borders: false,
  headerBorders: false,
  style: {},
  customStyles: {},
  cellHeight: 40
};

EditableTable.propTypes = {
  columns: PropTypes.array.isRequired,
  values: PropTypes.array,
  emptyRows: PropTypes.number,
  cellHeight: PropTypes.number,
  onCellChange: PropTypes.func,
  onColumnChange: PropTypes.func,
  customStyles: PropTypes.object,
  borders: PropTypes.bool,
  headerBorders: PropTypes.bool
};

export default EditableTable;
