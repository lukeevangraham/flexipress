import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import server from "../../../apis/server";

const ImageEdit = ({ existingImage }) => {
  const { authUser } = useAuth();
  let [image, setImage] = useState(null);
  let [uploadedImage, setUploadedImage] = useState(
    existingImage ? existingImage : null
  );

  const onChangeImage = (e) => {
    console.log("Image changed: ", e.target.files[0]);

    setImage(e.target.files[0]);
    setUploadedImage(URL.createObjectURL(e.target.files[0]));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitted", image);
    let formData = new FormData();
    formData.append("image", image);
    formData.append("userId", authUser.id);

    console.log("FD: ", formData);

    const response = await server.post("/addImage", formData);

    console.log("Response: ", response);
  };

  return (
    <div>
      {/* <form encType="multipart/form-data" onSubmit={onSubmit}> */}
        {/* <div> */}
          {uploadedImage ? (
            <img src={uploadedImage} />
          ) : (
            <div>Image placeholder</div>
          )}

          <label>
            <input
              type="file"
              name="image"
              id="image"
              // onChange={changed}
            />
            {/* Choose file */}
          </label>
        {/* </div> */}
        {/* <button>Submit image</button> */}
      {/* </form> */}
    </div>
  );
};

export default ImageEdit;
