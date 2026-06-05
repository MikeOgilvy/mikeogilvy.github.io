+++
date = '2026-03-28T2:24:29+08:00'
draft = false
title = 'ML-2 Note: Linear Models for Classification and GLMs'
math = true
tags = ["Machine Learning"]
+++

## 1. Why Classification Uses Logistic Regression

In classification problems, the target variable is discrete.

Binary classification example:

$$y \in \left\\{ 0,1 \right\\}$$

Given input features

$$x \in \mathbb{R}^d$$

we want to model

$$P(y=1|x)$$

### Problem with Linear Regression

A linear model predicts

$$f(x) = w^T x$$

but

$$w^T x \in (-\infty, \infty)$$

while probabilities must satisfy

$$P(y=1|x) \in [0,1]$$

Thus we need a function that maps

$$(-\infty,\infty) \rightarrow (0,1)$$

### Logistic Function

The logistic (sigmoid) function provides this mapping

$$\sigma(z) = \frac{1}{1 + e^{-z}}$$

Therefore we define the **logistic regression model**

$$P(y=1|x) = \sigma(w^T x)$$

This ensures predictions are valid probabilities.

---

## 2. Binary Logistic Regression

### 2.1 Model

The model assumes

$$P(y=1|x) = \sigma(w^T x)$$

$$P(y=0|x) = 1 - \sigma(w^T x)$$

Equivalently,

$$P(y|x) = \sigma(w^T x)^y (1-\sigma(w^T x))^{1-y}$$

This corresponds to a **Bernoulli distribution**.

---

### 2.2 Negative Log Likelihood (NLL)

Given dataset

$$\{(x_i,y_i)\}_{i=1}^{n}$$

Likelihood:

$$L(w) = \prod_{i=1}^{n} \sigma(w^T x_i)^{y_i} (1-\sigma(w^T x_i))^{1-y_i}$$

Take log likelihood

$$\log L(w) = \sum_{i=1}^{n} \left[ y_i \log \sigma(w^T x_i) + (1-y_i)\log(1-\sigma(w^T x_i)) \right]$$

Training maximizes likelihood or equivalently minimizes **Negative Log Likelihood**

$$\mathcal{L}(w) = - \sum_{i=1}^{n} \left[ y_i \log \hat y_i + (1-y_i)\log(1-\hat y_i) \right]$$

where

$$\hat y_i = \sigma(w^T x_i)$$

This is the **binary cross-entropy loss**.

---

### 2.3 Connection to KL Divergence

Let

- $q(y|x)$ be the true distribution
- $p(y|x;w)$ be the model distribution

The KL divergence is

$$D_{KL}(q||p) = \sum_y q(y|x) \log \frac{q(y|x)}{p(y|x;w)}$$

Expanding:

$$D_{KL}(q||p) = - \sum_y q(y|x)\log p(y|x;w) + \sum_y q(y|x)\log q(y|x)$$

The second term does not depend on $w$.

Therefore minimizing KL divergence is equivalent to minimizing

$$- \sum_y q(y|x)\log p(y|x;w)$$

which is exactly the **negative log likelihood**.

Thus

$$\text{Minimize NLL} \quad \Longleftrightarrow \quad \text{Minimize KL divergence}$$

---

### 2.4 Training via Gradient

Define

$$z_i = w^T x_i$$

$$\hat y_i = \sigma(z_i)$$

Loss:

$$\mathcal{L}(w) = - \sum_{i=1}^{n} [ y_i\log \hat y_i + (1-y_i)\log(1-\hat y_i) ]$$

Compute gradient:

$$\frac{\partial \mathcal{L}}{\partial w} = - \sum_{i=1}^{n} (y_i-\hat y_i)x_i$$

Thus

$$\nabla_w \mathcal{L} = \sum_{i=1}^{n} (\hat y_i-y_i)x_i$$

This leads to gradient descent update

$$w \leftarrow w - \eta \nabla_w \mathcal{L}$$

Interpretation:

Training adjusts $w$ so that predicted probabilities match observed labels.

---

## 3. Multiclass Classification

For $K$ classes

$$y \in \{1,2,\dots,K\}$$

We assign a linear score to each class

$$z_k = w_k^T x$$

These scores are converted to probabilities using the **Softmax function**

$$P(y=k|x) = \frac{e^{z_k}}{\sum_{j=1}^{K} e^{z_j}}$$

or

$$P(y=k|x) = \frac{e^{w_k^T x}}{\sum_{j=1}^{K} e^{w_j^T x}}$$

This ensures

$$\sum_{k=1}^{K} P(y=k|x) = 1$$

Training again uses **negative log likelihood**

$$\mathcal{L} = -\sum_{i=1}^{n} \log P(y_i|x_i)$$

This model is known as **Softmax Regression** or **Multinomial Logistic Regression**.

---

## 4. Exponential Family of Distributions

Many probability distributions belong to the **exponential family**.

General form:

$$p(y|\eta) = h(y) \exp \left( \eta^T T(y) - A(\eta) \right)$$

Components:

### 1. $T(y)$ — Sufficient Statistic

Captures all relevant information from data about the parameter.

### 2. $\eta$ — Natural Parameter

Parameterization of the distribution used in the exponential form.

### 3. $A(\eta)$ — Log Partition Function

Ensures the distribution is normalized:

$$\int p(y|\eta)dy = 1$$

Also determines the mean and variance.

### 4. $h(y)$ — Base Measure

Depends only on the data, not the parameters.

---

### 4.1 Gaussian Distribution as Exponential Family

Gaussian distribution

$$p(y|\mu,\sigma^2) = \frac{1}{\sqrt{2\pi\sigma^2}} \exp \left( -\frac{(y-\mu)^2}{2\sigma^2} \right)$$

Rewrite in exponential family form:

Natural parameter

$$\eta = \frac{\mu}{\sigma^2}$$

Sufficient statistic

$$T(y) = y$$

Log partition function

$$A(\eta) = \frac{\mu^2}{2\sigma^2}$$

Thus Gaussian distribution belongs to the exponential family.

---

### 4.2 Bernoulli Distribution as Exponential Family

Bernoulli distribution

$$p(y|\phi) = \phi^y (1-\phi)^{1-y}$$

Rewrite:

$$p(y|\eta) = \exp \left( y\eta - \log(1+e^\eta) \right)$$

where

$$\eta = \log\frac{\phi}{1-\phi}$$

Thus

Sufficient statistic

$$T(y) = y$$

Log partition function

$$A(\eta) = \log(1+e^\eta)$$

This form directly leads to **logistic regression**.

---

## 5. Generalized Linear Models (GLMs)

GLMs extend linear models to distributions in the exponential family.

A GLM consists of three components.

### 1. Random Component

Response variable follows an exponential family distribution

$$y \sim p(y|\eta)$$

### 2. Linear Predictor

A linear combination of features

$$z = w^T x$$

### 3. Link Function

Relates the mean of the distribution to the linear predictor

$$g(\mathbb{E}[y|x]) = w^T x$$

or

$$\mathbb{E}[y|x] = g^{-1}(w^T x)$$

---

### 5.1 Examples of GLMs

### Linear Regression

Distribution: Gaussian

Link function:

$$\mathbb{E}[y|x] = w^T x$$

---

### Logistic Regression

Distribution: Bernoulli

Link function:

$$\log\frac{p}{1-p} = w^T x$$

Inverse link

$$p = \sigma(w^T x)$$

