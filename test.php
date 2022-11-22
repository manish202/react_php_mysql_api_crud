<?php
    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: http://localhost:3000");
    $req = file_get_contents("php://input");
    $data = json_decode($req,true);
    if($data != null){
        if(empty($data["target"])){
            die(json_encode(array("message" => "target is missing.","status" => false)));
        }
    }else{
        die(json_encode(array("message" => "only json data accepted.","status" => false)));
    }
    class database{
        private $host = "localhost";
        private $user = "root";
        private $password = "";
        private $db_name = "ajax_crud";

        private $conn = false;
        private $mysqli = "";
        private $result = [];

        function __construct(){
            if(!$this->conn){
                $this->mysqli = new mysqli($this->host,$this->user,$this->password,$this->db_name);
                if($this->mysqli->connect_error){
                    $this->result["message"] = "connection failed error is == ".$this->mysqli->connect_error;
                    $this->result["status"] = false;
                    return false;
                }else{
                    $this->conn = true;
                    return true;
                }
            }
        }
        private function check_table($table){
            $sql = "SHOW TABLES FROM $this->db_name LIKE '$table'";
            $x = $this->mysqli->query($sql);
            if($x){
                if($x->num_rows == 1){
                    return true;
                }else{
                    $this->result["message"] = "table $table does not exists.";
                    $this->result["status"] = false;
                    return false;
                }
            }else{
                $this->result["message"] = $this->mysqli->error;
                $this->result["status"] = false;
                return false;
            }
        }
        public function get_result(){
            $x = $this->result;
            $this->result = [];
            return $x;
        }
        private function run_sql($sql){
            if($this->mysqli->query($sql)){
                $this->result["message"] = "task completed success.";
                $this->result["status"] = true;
                return true;
            }else{
                $this->result["message"] = $this->mysqli->error;
                $this->result["status"] = false;
                return false;
            }
        }
        //pagination
        public function pagination($table,$join=null,$where=null,$limit=5){
            if($this->check_table($table)){
                $sql = "SELECT COUNT(*) as total FROM $table";
                if($join != null){
                    $sql .= " JOIN $join";
                }
                if($where != null){
                    $sql .= " WHERE $where";
                }
                if($x = $this->mysqli->query($sql)){
                    if($x->num_rows == 1){
                        $res = $x->fetch_assoc();
                        $total_records = $res['total'];
                        $total_page = ceil($total_records / $limit);
                        array_push($this->result,["total_page" => $total_page]);
                    }else{
                        $this->result["message"] = "pagination problem found.";
                        $this->result["status"] = false;
                        return false;
                    }
                }else{
                    $this->result["message"] = $this->mysqli->error;
                    $this->result["status"] = false;
                    return false;
                }
            }
        }
        //select data
        public function select_data($table,$row="*",$join=null,$where=null,$order=null,$limit=null){
            if($this->check_table($table)){
                $sql = "SELECT $row FROM $table";
                if($join != null){
                    $sql .= " JOIN $join";
                }
                if($where != null){
                    $sql .= " WHERE $where";
                }
                if($order != null){
                    $sql .= " ORDER BY $order";
                }
                if($limit != null){
                    $sql .= " LIMIT $limit";
                }
                if($s = $this->mysqli->query($sql)){
                    if($s->num_rows > 0){
                        array_push($this->result,$s->fetch_all(MYSQLI_ASSOC));
                    }else{
                        $this->result["message"] = "no records found.";
                        $this->result["status"] = false;
                    }
                }else{
                    $this->result["message"] = $this->mysqli->error;
                    $this->result["status"] = false;
                    return false;
                }
            }
        }
        //insert data
            public function insert_data($table,$arr){
                if($this->check_table($table)){
                    $s = implode(",",array_keys($arr));
                    $q = implode("','",$arr);
                    $this->run_sql("INSERT INTO $table($s) VALUES('$q')");
                }
            }
        //update data
        public function update_data($table,$arr,$where){
            if($this->check_table($table)){
                $x = [];
                foreach($arr as $key=>$val){
                    $x[] .= "$key = '$val'";
                }
                $x = implode(", ",$x);
                $sql = "UPDATE $table SET $x WHERE $where";
                $this->run_sql($sql);
            }
        }
        //delete data
        public function delete_data($table,$where){
            if($this->check_table($table)){
                $this->run_sql("DELETE FROM $table WHERE $where");
            }
        }
        function __destruct(){
            if($this->conn){
                if($this->mysqli->close()){
                    $this->conn = false;
                    return true;
                }
            }
        } 
    }

    $obj = new database();
    if($data['target'] == "select"){
        if(!empty($data['page'])){
            $page = $data['page'];
        }else{
            $page = 1;
        }
        $limit = 5;
        $offset = ($page - 1)* $limit;
	if($data['q'] == ""){
		$obj->select_data("students","*",null,null,"sid DESC","$offset,$limit");
        	$obj->pagination("students",null,null,$limit);
	}else{
		$obj->select_data("students","*",null,"CONCAT(fname,lname) LIKE '%{$data['q']}%'","sid DESC","$offset,$limit");
        	$obj->pagination("students",null,"CONCAT(fname,lname) LIKE '%{$data['q']}%'",$limit);
	}
    }elseif($data['target'] == "insert"){
        if(!empty($data['fname']) && !empty($data['lname'])){
            $obj->insert_data("students",["fname" => $data['fname'],"lname" => $data['lname']]);
        }else{
            die(json_encode(array("message" => "fname or lname is missing.","status" => false)));
        }
    }elseif($data['target'] == "update"){
        if(!empty($data['fname']) && !empty($data['lname']) && !empty($data['sid'])){
            $obj->update_data("students",["fname" => $data['fname'],"lname" => $data['lname']],"sid = {$data['sid']}");
        }else{
            die(json_encode(array("message" => "fname or lname or sid is missing.","status" => false)));
        }
    }elseif($data['target'] == "delete"){
        if(!empty($data['sid'])){
            $obj->delete_data("students","sid = {$data['sid']}");
        }else{
            die(json_encode(array("message" => "sid is missing.","status" => false)));
        }
    }else{
        die(json_encode(array("message" => "target is wrong.","status" => false)));
    }
    echo json_encode($obj->get_result());
?>