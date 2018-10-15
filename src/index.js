import React from "react";
import { render } from "react-dom";

// Create generic HOC that will intercept Promise props and pass its result to child component.
// E.g. we want to be able to use SocialActivity component like that:
// <SocialActivity retweetsCount={retweetsCountPromise} fbRepostsCount={fbRepostsCountPromise} linkedinRepostsCount={linkedinRepostsCountPromise}/>
const SocialActivityComponent = props => {
  return (
    <div>
      <div>Retweets: {props.retweetsCount}</div>
      <div>Reposts in Facebook: {props.fbRepostsCount}</div>
      <div>Reposts in Linkedin: {props.linkedinRepostsCount}</div>
    </div>
  );
};

// Implementation goes here
// Should also handle rejections
class Await extends React.Component {
  /**received childComponentProps and childComponent as props */
  constructor(props) {
    super(props);
    this.state = {
      passedChildProps: {}
    };
  }

  setPromisePropResult = (prop, result) => {
    const newPassedProps = {
      ...this.state.passedChildProps,
      [prop]: result
    };
    this.setState({
      passedChildProps: newPassedProps
    });
  };

  componentDidMount() {
    this.childProps = this.props.childComponentProps;

    for (let prop in this.childProps) {
      //if promise use .then, otherwise set result immediately
      this.childProps[prop]
        .then(result => this.setPromisePropResult(prop, result))
        .catch(error => this.setPromisePropResult(prop, "couldn't retrieve"));
    }
  }

  render() {
    const ChildComponent = this.props.childComponent;
    return <ChildComponent {...this.state.passedChildProps} />;
  }
}

const awaitHOC = childComponent => {
  return props => {
    return (
      <Await childComponentProps={props} childComponent={childComponent} />
    );
  };
};

const SocialActivity = awaitHOC(SocialActivityComponent);

render(
  <SocialActivity
    retweetsCount={Promise.resolve(1)}
    fbRepostsCount={Promise.reject(new Error("problem!"))}
    linkedinRepostsCount={Promise.resolve(3)}
  />,
  document.getElementById("root")
);
