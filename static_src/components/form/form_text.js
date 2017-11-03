import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import FormElement from "./form_element";
import FormError from "./form_error";

export default class FormText extends FormElement {
  renderError() {
    if (!this.state.err) {
      return null;
    }

    return <FormError message={this.state.err.message} />;
  }

  renderLabel() {
    const { label } = this.props;

    // Spaces in label give a healthy space for inline forms
    return <label htmlFor={this.key}> {label} </label>;
  }

  render() {
    const { inline, labelAfter, "data-test": dataTest } = this.props;

    return (
      <div
        className={classNames({
          "form_text-inline": inline,
          error: !!this.state.err
        })}
      >
        {!labelAfter && this.renderLabel()}
        <input
          type="text"
          id={this.key}
          value={this.state.value}
          onChange={this.onChange}
          className={this.classes}
          data-test={dataTest}
        />
        {labelAfter && this.renderLabel()}
        {this.renderError()}
      </div>
    );
  }
}

FormText.propTypes = {
  ...FormElement.propTypes,
  inline: PropTypes.bool,
  labelAfter: PropTypes.bool
};

FormText.defaultProps = {
  ...FormElement.defaultProps,
  inline: false,
  labelAfter: false
};
