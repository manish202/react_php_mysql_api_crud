import {useEffect,useState} from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App(){
    //store api data
    let [jdata,updata] = useState([]);
    //loader...
    let [load,chLoading] = useState(true);
    //load table based upon pagination
    let [current_page,chpage] = useState(1);
    //recall api data when add,update,delete data
    let [recall,chrecall] = useState(false);
    //add and edit data form hide or show
    let [showForm,updateForm] = useState({add:false,edit:false});
    //onchange handling when update data
    let [userData,chUserData] = useState({fname:"",lname:"",sid:""});
    //live search
    let [searchTerm,upSearch] = useState("");
    useEffect(() => {
        fetch("http://localhost/ajax_crud/test.php",{
        method:"POST",
        body: JSON.stringify({target:"select",page:current_page,q:searchTerm})
        })
        .then(res => res.json())
        .then((data) => {
        updata(data);
        chLoading(false);
        }).catch((err) => {
        console.log(`error is ${err}`);
        });
    },[current_page,recall,searchTerm]);

    let process = async (data) => {
        let res = await fetch("http://localhost/ajax_crud/test.php",{
            method:"POST",
            body: JSON.stringify(data)
        });
        return await res.json();
    }
    function AddForm(){
        return <div className="popup">
        <form onSubmit={submited} autoComplete="off" name="add">
            <button type="button" className="btn btn-success close" onClick={() => {updateForm({add:false,edit:false})}}>X</button>
            <div className="mb-3">
                <label className="form-label">first name</label>
                <input type="text" className="form-control" name="fname" placeholder="first name" required />
            </div>
            <div className="mb-3">
                <label className="form-label">last name</label>
                <input type="text" className="form-control" name="lname" placeholder="last name" required />
            </div>
            <button type="submit" className="btn btn-success">add</button>
        </form>
    </div>
    }
    
    function submited(e){
        e.preventDefault();
        let {name,fname,lname,sid=0} = e.target;
        if(fname.value.trim() === "" || lname.value.trim() === ""){
          toast.warn('please fill all data', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            });
            return false;
        }
        let xname = name === "add" ? "insert":"update";
        process({target:xname,fname:fname.value,lname:lname.value,sid:sid.value}).then((res) => {
            if(res.status){
                updateForm({add:false,edit:false});
                chrecall((old) => !old);
            }else{
                alert(res.message);
            }
        }).catch(err => console.log(err));
    }
    function inpChange(e){
        let {name,value} = e.target;
        chUserData((old) => {
            return {
                ...old,
                [name]: value
            }
        });
    }
    
    function edit(val){
        updateForm({add:false,edit:true});
        chUserData(val);
    }
    function del(sid){
        process({target:"delete",sid:sid}).then((res) => {
            if(res.status){
                chrecall((old) => !old);
            }else{
                alert(res.message);
            }
        }).catch(err => console.log(err));
    }
    function GetData(){
        if(jdata[0] !== undefined){
            return jdata[0].map((val) => {
                let {sid,fname,lname} = val;
                return <tr key={sid}>
                        <td>{sid}</td>
                        <td>{fname}</td>
                        <td>{lname}</td>
                        <td><button className="btn btn-success mx-2" onClick={() => {edit(val)}}>edit</button><button className="btn btn-danger mx-2" onClick={() => {del(sid)}}>delete</button></td>
                      </tr>
              });
        }else{
            return <tr><td colSpan='4'>its take time</td></tr>;
        }
    }
    function Pagination(){
        if(jdata[1] !== undefined){
            let total_page = jdata[1].total_page;
            let arr = [];
            for(let i=1;i<=total_page;i++){
                let active = current_page === i ? "btn-dark":"btn-light";
                arr.push(<li key={i} className="page-item"><button onClick={() => {chpage(i)}} className={`btn ${active}`}>{i}</button></li>);
            }
            return arr;
        }else{
            return false;
        }
    }
    return <div className="container box">
                <h1>react js - php - mysql - api - crud</h1>
                <nav className="navbar navbar-dark bg-dark navbar-expand-sm">
                    <div className="container-fluid">
                        <form className="d-flex" id="search">
                            <input className="form-control me-2 search" value={searchTerm} onChange={(e) => {upSearch(e.target.value)}} type="search" placeholder="Live Search" />
                        </form>
                    </div>
                </nav>
                <h2 className="text-capitalize p-3">all records</h2>
                <button className='btn btn-primary mb-2 add' onClick={() => {updateForm({add:true,edit:false})}}>Add New Record</button>
                <table className="table text-center table-hover text-capitalize">
                <thead>
                    <tr><td colSpan="4" className="warn"></td></tr>
                    <tr>
                        <th>id</th>
                        <th>first name</th>
                        <th>last name</th>
                        <th>action</th>
                    </tr>
                </thead>
                <tbody>
                {load && <tr><td colSpan="4">loading....</td></tr>}
                {jdata.message === undefined ? <GetData />:<tr><td colSpan="4">{jdata.message}</td></tr>}
                </tbody>
                <tfoot>
                <tr>
                    <td colSpan="6">
                        <ul className="pagination mt-3 justify-content-center">
                            <Pagination />
                        </ul>
                    </td>
                </tr>
                </tfoot>
                </table>
                {showForm.add && <AddForm />}
                {showForm.edit && <div className="popup">
        <form onSubmit={submited} autoComplete="off" name="edit">
            <button type="button" className="btn btn-success close" onClick={() => {updateForm({add:false,edit:false})}}>X</button>
            <div className="mb-3">
                <label className="form-label">first name</label>
                <input type="text" className="form-control" value={userData.fname} onChange={inpChange} name="fname" placeholder="first name" required />
                <input type="hidden" name="sid" value={userData.sid} />
            </div>
            <div className="mb-3">
                <label className="form-label">last name</label>
                <input type="text" className="form-control" value={userData.lname} onChange={inpChange} name="lname" placeholder="last name" required />
            </div>
            <button type="submit" className="btn btn-success">update</button>
        </form>
    </div>}
    <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClickrtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
}
export default App;