/**
 * Copyright 2019-2021 Opstrace, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";
import styled from "styled-components";

export type EmojiProps = {
  ariaLabel: string;
  emoji: string;
  size?: number;
};

type SpanProps = {
  "aria-label": string;
  role: string;
  size?: number;
};

const Wrapper = styled.span<SpanProps>(props => ({
  fontSize: props.size ? `${props.size}px` : "inherit"
}));

const Emoji = ({ emoji, ariaLabel, size }: EmojiProps) => (
  <Wrapper aria-label={ariaLabel} role="img" size={size}>
    {emoji}
  </Wrapper>
);

export default Emoji;
