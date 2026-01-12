import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import Button from "../../UI/Button/Button";

import classes from "./FeatureManager.module.scss";

const FeatureManager = ({
  title,
  rowData,
  onToggle,
  itemType = "Item",
  nameField = "name",
}) => {
  // 1. FILTER DATA INTO TWO GROUPS

  const featured = useMemo(
    () => rowData.filter((i) => i.isFeaturedOnHome),
    [rowData]
  );
  const available = useMemo(
    () => rowData.filter((i) => !i.isFeaturedOnHome),
    [rowData]
  );

  // // 2. Define Columns (Only defined once here)
  // const createColDefs = (isFeaturedGrid) => [
  //   { field: nameField, headerName: `${itemType} Name`, filter: true, flex: 3 },
  //   {
  //     headerName: "Action",
  //     cellRenderer: (params) => (
  //       <Button clicked={() => onToggle(params.data)}>
  //         {isFeaturedGrid ? "Remove" : "Feature"}
  //       </Button>
  //     ),
  //   },
  // ];

  // 2. Define Columns (Stable definitions for better performance)
  const featuredColDefs = useMemo(
    () => [
      {
        field: nameField,
        headerName: `${itemType} Name`,
        filter: true,
        flex: 3,
      },
      {
        headerName: "Action",
        width: 120,
        cellRenderer: (params) => (
          <Button clicked={() => onToggle(params.data)}>Remove</Button>
        ),
      },
    ],
    [nameField, itemType, onToggle]
  );

  const availableColDefs = useMemo(
    () => [
      {
        field: nameField,
        headerName: `${itemType} Name`,
        filter: true,
        flex: 3,
      },
      {
        headerName: "Action",
        width: 120,
        cellRenderer: (params) => (
          <Button clicked={() => onToggle(params.data)}>Feature</Button>
        ),
      },
    ],
    [nameField, itemType, onToggle]
  );

  return (
    <div className={classes.FeatureManager}>
      <h2>{title}</h2>

      <h4>Currently Featured</h4>
      <div className="ag-theme-quartz">
        <AgGridReact
          rowData={featured}
          columnDefs={featuredColDefs}
          domLayout="autoHeight"
          overlayNoRowsTemplate={`No ${itemType.toLowerCase()}s featured yet.`}
        />
      </div>

      <h4>Available to Feature</h4>
      <div className="ag-theme-quartz">
        <AgGridReact
          rowData={available}
          columnDefs={availableColDefs}
          domLayout="autoHeight"
          pagination={true}
          paginationPageSize={10}
        />
      </div>
    </div>
  );
};

export default FeatureManager;
