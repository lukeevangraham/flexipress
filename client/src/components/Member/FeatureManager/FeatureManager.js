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
          <Button clicked={() => onToggle(params.data)} small color={"grey"}>
            Remove
          </Button>
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
        // floatingFilter: true,
      },
      {
        headerName: "Action",
        width: 120,
        cellRenderer: (params) => (
          <Button clicked={() => onToggle(params.data)} small>
            Feature
          </Button>
        ),
      },
    ],
    [nameField, itemType, onToggle]
  );

  return (
    <div className={classes.FeatureManager}>
      <h2>{title}</h2>

      <h4>Currently Featured</h4>
      <div className={`ag-theme-quartz ${classes.FeatureManager__Featured}`}>
        <AgGridReact
          rowData={featured}
          columnDefs={featuredColDefs}
          domLayout="autoHeight"
          overlayNoRowsTemplate={`No ${itemType.toLowerCase()}s featured yet.`}
        />
      </div>

      <h4>Available to Feature</h4>
      <div className={`ag-theme-quartz ${classes.FeatureManager__Featured}`}>
        <AgGridReact
          rowData={available}
          columnDefs={availableColDefs}
          domLayout="autoHeight"
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={false}
        />
      </div>
    </div>
  );
};

export default FeatureManager;
