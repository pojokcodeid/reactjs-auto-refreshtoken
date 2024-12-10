import { useState, useEffect } from "react";
import api from "../axiosConfig";

const PersonalData = () => {
  const [personalData, setPersonalData] = useState([]);
  const [newData, setNewData] = useState({ id: "", name: "", email: "" });
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ id: "", name: "", email: "" });

  const fetchData = async () => {
    try {
      const res = await api.get("/personaldata");
      setPersonalData(res.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (editMode) {
      setEditData((prevData) => ({
        ...prevData,
        [name]: name === "id" ? parseInt(value, 10) : value,
      }));
    } else {
      setNewData((prevData) => ({
        ...prevData,
        [name]: name === "id" ? parseInt(value, 10) : value,
      }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/personaldata/${editData.id}`, editData);
        setEditMode(false);
        setEditData({ id: "", name: "", email: "" });
      } else {
        await api.post("/personaldata", newData);
        setNewData({ id: "", name: "", email: "" });
      }
      fetchData();
    } catch (error) {
      console.error("Error submitting data", error);
    }
  };

  const handleEdit = (data) => {
    setEditMode(true);
    setEditData(data);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/personaldata/${id}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting data", error);
    }
  };

  return (
    <div>
      <h2>Personal Data</h2>
      <ul>
        {personalData.map((data) => (
          <li key={data.id}>
            {data.name} - {data.email}
            <button onClick={() => handleEdit(data)}>Edit</button>
            <button onClick={() => handleDelete(data.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="id"
          placeholder="ID"
          value={editMode ? editData.id : newData.id}
          onChange={handleChange}
          disabled={editMode}
        />
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={editMode ? editData.name : newData.name}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={editMode ? editData.email : newData.email}
          onChange={handleChange}
        />
        <button type="submit">{editMode ? "Update" : "Add"}</button>
      </form>
    </div>
  );
};

export default PersonalData;
