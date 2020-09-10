import React from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroup,
  Row,
  Col,
  Container,
  Table
} from 'reactstrap';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleChangeReceiver = this.handleChangeReceiver.bind(this);
    this.handleChangeMessage = this.handleChangeMessage.bind(this);
    this.receivedMessage = this.receivedMessage.bind(this);
    this.state = {
      nymClient: "",
      sender: "",
      receiver: "",
      message: "Hello mixnet!",
      transfers: [],
    }
  }
  componentDidMount() {
    this.loadWasm();
  }
  handleChangeReceiver(e) {
    this.setState({receiver: e.target.value});
  }
  handleChangeMessage(e) {
    this.setState({message: e.target.value});
  }
  loadWasm = async () => {
    try {
      const wasm = await import('@nymproject/nym-client-wasm/client');
      this.setState({wasm});
      // Set up identity and client
      let directory = "https://directory.nymtech.net";
      let identity = new wasm.Identity();
      let _nymClient = new wasm.Client(directory, identity, null);
      _nymClient.onText = this.receivedMessage;
      this.setState({nymClient: _nymClient});
      // Start the Nym client. Connects to a Nym gateway via websocket.
      await _nymClient.start();
      let _sender = _nymClient.formatAsRecipient();
      this.setState({sender: _sender});
    } catch(err) {
      console.error(`Unexpected error in loadWasm. [Message: ${err.message}]`);
    }
  }
  sendmessage(message, receiver) {
    this.state.nymClient.sendMessage(message, receiver);
    let timestamp = new Date().toISOString().substr(11, 12);
    this.setState({
      transfers: this.state.transfers.concat({time: timestamp, direction: "sent", message: message})
    })
  }
  receivedMessage (message) {
    let timestamp = new Date().toISOString().substr(11, 12);
    this.setState({
      transfers: this.state.transfers.concat({time: timestamp, direction: "received", message: message})
    })
  }
  renderTableData() {
    return this.state.transfers.map((transfers, index) => {
       const { time, direction, message } = transfers //destructuring
       
       return (
        <tr key={index} >
          {direction === "sent" ?
            <>
            <td className="text-primary">{time}</td>
            <td className="text-primary">{direction}</td>
            <td className="text-primary">{message}</td>
            </>
          :
            <>
            <td className="text-success">{time}</td>
            <td className="text-success">{direction}</td>
            <td className="text-success">{message}</td>
            </>
          }
        </tr>
       )
    })
  }
  render() {
    return (
      <>
        <div className="main-content">
          <div className="header bg-gradient-info py-7 py-lg-8">
            <Container>
              <div className="header-body text-center mb-7">
                <Row className="justify-content-center">
                  <Col lg="5" md="6">
                    <h1 className="text-white">NYM</h1>
                    <p className="text-lead text-light">
                      Example react peaps implementation
                    </p>
                  </Col>
                </Row>
              </div>
            </Container>
          </div>
          {/* Page content */}
          <Container className="mt--8 pb-5">
            <Row className="justify-content-center">
              <Col lg="6" md="8">
                <Card className="bg-secondary shadow border-0">
                  <CardHeader className="bg-transparent pb-1">
                    <div className="text-center mt-2 mb-4">
                    Test NYM by sending a private message
                    </div>
                  </CardHeader>
                  <CardBody className="px-lg-5 py-lg-5">
                    <Form role="form">
                      <FormGroup>
                        <InputGroup className="input-group-alternative mb-3">
                          <Input 
                            readOnly
                            value={this.state.sender}
                            type="text"
                          />
                        </InputGroup>
                      </FormGroup>
                      <FormGroup>
                        <InputGroup className="input-group-alternative mb-3">
                          <Input 
                            placeholder="Receiver" 
                            type="text"
                            onChange={this.handleChangeReceiver}
                          />
                        </InputGroup>
                      </FormGroup>
                      <FormGroup>
                        <InputGroup className="input-group-alternative mb-3">
                          <Input 
                            placeholder={this.state.message} 
                            type="text"
                            onChange={this.handleChangeMessage}
                          />
                        </InputGroup>
                      </FormGroup>
                      <div className="text-center">
                        <Button 
                          className="mt-4" 
                          color="primary" 
                          type="button"
                          onClick={() => this.sendmessage(this.state.message, this.state.receiver)}
                        >
                          Send private message
                        </Button>
                      </div>
                    </Form>
                  </CardBody>
                </Card>
              </Col>
              <Col lg="6" md="8">
              <Card className="bg-secondary shadow border-0">
                  <CardHeader className="bg-transparent pb-1">
                    <div className="text-center mt-2 mb-4">
                    Message history
                    </div>
                  </CardHeader>
                  <CardBody className="px-lg-5 py-lg-5">
                    <Table className="align-items-center" responsive>
                      <thead className="thead-light">
                        <tr>
                          <th scope="col">Time</th>
                          <th scope="col">In/Out</th>
                          <th scope="col">Message</th>
                          <th scope="col" />
                        </tr>
                      </thead>
                      <tbody>
                        {this.renderTableData()}
                      </tbody>
                    </Table>
                    </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </>  
    );
  }
}

export default App;
