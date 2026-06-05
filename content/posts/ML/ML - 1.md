+++
date = '2026-03-22T3:32:29+08:00'
draft = false
title = 'ML-1 Note: Supervised Learning; Linear Regression'
math = true
tags = ["Machine Learning"]
+++

## 1. Basic Model of Linear Regression

Linear Regression is one of the simplest and most fundamental models in **supervised learning**.  
The goal is to model the relationship between input features and a continuous target variable.

### Model Form

For a dataset with feature vector \\(x\\):

\\[
y = w^T x + b
\\]

or equivalently

\\[
\hat{y} = \theta^T x
\\]

where:

- \\(x\\): input feature vector  
- \\(w\\): weight vector  
- \\(b\\): bias term  
- \\(\theta\\): parameter vector (including bias)  
- \\(\hat{y}\\): predicted value  

---

### Loss Function

The most common loss function for linear regression is **Mean Squared Error (MSE)**.

\\[
L_{MSE} = \frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2
\\]

where:

- \\(n\\): number of samples  
- \\(y_i\\): true value  
- \\(\hat{y}_i\\): predicted value  

The training objective is:

\\[
\min_\theta L_{MSE}
\\]

---

## 2. Solvers for Linear Regression

There are two classical ways to solve linear regression:

1. Gradient Descent (GD)
2. Normal Equation

---

### 2.1 Gradient Descent (GD)

Gradient Descent is an **iterative optimization algorithm**.

#### Update Rule

\\[
\theta := \theta - \alpha \nabla_\theta L
\\]

where:

- \\(\alpha\\) is the learning rate  
- \\(\nabla_\theta L\\) is the gradient of the loss function

For MSE:

\\[
\nabla_\theta L = \frac{2}{n}X^T(X\theta - y)
\\]

---

#### Computational Issue

When the dataset is very large:

- computing gradients over the **entire dataset** can be slow.

A common trick is to **use a smaller subset of data** to estimate the gradient, such as:

- **Stochastic Gradient Descent (SGD)**
- **Mini-batch Gradient Descent**

This reduces computation time and speeds up training.

---

### 2.2 Normal Equation

Linear regression also has a **closed-form solution**.

\\[
\theta = (X^T X)^{-1} X^T y
\\]

Advantages:

- No iterative optimization required
- Exact solution

Disadvantages:

- Matrix inversion costs \\(O(d^3)\\)
- Not suitable when the number of features is very large

---

### Probability View of Linear Regression

Assume the data is generated as:

\\[
y = w^T x + \epsilon
\\]

where noise:

\\[
\epsilon \sim N(0, \sigma^2)
\\]

Then the conditional distribution is:

\\[
p(y|x) = N(w^T x, \sigma^2)
\\]

The likelihood for the dataset is:

\\[
L = \prod_i p(y_i | x_i)
\\]

Taking the log-likelihood:

\\[
\log L = -\frac{1}{2\sigma^2}\sum (y_i - w^T x_i)^2 + C
\\]

Maximizing the log-likelihood is therefore equivalent to minimizing:

\\[
\sum (y_i - w^T x_i)^2
\\]

Thus:

\\[
L_{LL} \equiv L_{MSE}
\\]

So **MSE minimization is equivalent to Maximum Likelihood Estimation (MLE)** under Gaussian noise.

---

## 3. Underfitting and Overfitting

### Underfitting

Underfitting occurs when the model is **too simple** to capture the true relationship.

Characteristics:

- High training error
- High testing error

Example:

- fitting a linear model to highly nonlinear data

---

### Overfitting

Overfitting occurs when the model **fits noise in the training data**.

Characteristics:

- Very low training error
- High testing error

Typical cause:

- too many parameters
- small dataset

---

## 4. Regularization to Prevent Overfitting

Regularization adds a **penalty term** to the loss function.

Two common methods:

1. Ridge Regression (L2)
2. Lasso Regression (L1)

---

### 4.1 Ridge Regression (L2 Regularization)

Ridge regression modifies the loss function:

\\[
L = \sum (y_i - w^T x_i)^2 + \lambda ||w||^2
\\]

where:

- \\(\lambda\\) controls the regularization strength.

---

#### Normal Equation for Ridge Regression

The closed-form solution becomes:

\\[
\theta = (X^T X + \lambda I)^{-1} X^T y
\\]

Advantages:

- prevents matrix singularity
- stabilizes estimation

---

#### Gradient Descent for Ridge Regression

The gradient becomes:

\\[
\nabla_\theta L = \frac{2}{n}X^T(X\theta - y) + 2\lambda\theta
\\]

Update rule:

\\[
\theta := \theta - \alpha \nabla_\theta L
\\]

---

#### Probability View of Ridge Regression

Ridge regression can be interpreted using **Bayesian statistics**.

Assume:

Likelihood:

\\[
y|x,w \sim N(w^T x, \sigma^2)
\\]

Prior on parameters:

\\[
w \sim N(0, \tau^2 I)
\\]

Then the posterior maximization:

\\[
\max_w p(w|D)
\\]

is equivalent to minimizing:

\\[
\sum (y_i - w^T x_i)^2 + \lambda ||w||^2
\\]

Thus:

**Ridge regression = MAP estimation with Gaussian prior on weights.**

---

### 4.2 Lasso Regression (L1 Regularization)

Lasso regression modifies the loss function as:

\\[
L = \sum (y_i - w^T x_i)^2 + \lambda ||w||_1
\\]

where

\\[
||w||_1 = \sum |w_i|
\\]


Properties:

- encourages **sparse solutions**
- performs **feature selection**

---

#### Common Solution Methods

Unlike ridge regression, Lasso **does not have a closed-form solution**.

Typical optimization methods include:

- Coordinate Descent
- Subgradient Methods
- Least Angle Regression (LARS)
- Proximal Gradient Methods

---
## 5. Model Selection and Generalization Gap

### 5.1 True Error (Expected Risk)

Assume the data are drawn i.i.d. from an unknown distribution (D):

<div>
\[
(x,y) \sim D
\]
</div>

For a model (f) and loss function (L(y,f(x))), the **true error** (expected risk) is defined as

<div>
\[ \mathcal{L}_D(f) = \mathbb{E}_{(x,y) \sim D}[L(y,f(x))] \]
</div>

This measures the **average prediction error over the true data distribution**.

---

### 5.2 Validation / Empirical Error

Instead, we estimate the performance using a **finite validation dataset**

<div>
\[
D_{val} = \{(x^{(i)},y^{(i)})\}_{i=1}^{|D_{val}|}
\]
</div>

The **validation error** is

<div>
\[ \mathcal{L}_{val}(f) = \frac{1}{|D_{val}|} \sum_{(x^{(i)},y^{(i)}) \in D_{val}} L(y^{(i)},f(x^{(i)})) \]
</div>

---

### 5.3 Generalization Gap

The **generalization gap** measures the discrepancy between the true error and the empirical estimate:

<div>
\[
\left| \mathcal{L}_D(f) - \mathcal{L}_{val}(f) \right|
\]
</div>

If the validation set is sampled i.i.d. from the same distribution (D),

<div>
\[
\mathcal{L}_D(f) = \mathbb{E}_{D_{val} \sim D}[\mathcal{L}_{val}(f)]
\]
</div>

---

### 5.4 Generalization Bound

Assume the loss is bounded: \\( L(\cdot,\cdot) \in [a,b] \\) and the validation set \\( D_{val} \\) is drawn i.i.d. from (D).

With probability at least \\( 1-\delta \\),

<div>
\[
|\mathcal{L}_D(f) - \mathcal{L}_{val}(f)|
\le
\sqrt{\frac{(b-a)^2 \ln(2/\delta)}{2|D_{val}|}}
\]
</div>

---

### 5.5 Effect of Testing Multiple Models

In model selection, we often test **multiple models or hyperparameters**. Suppose we evaluate (K) candidate models: \\( f_1,f_2,\dots,f_K \\).

The maximum deviation across all (K) trials can be bounded as:

<div>
\[
\Pr\left[
\mathcal{L}_D(f_k)
\ge
\mathcal{L}_{val}(f_k)
+
\sqrt{\frac{(b-a)^2 \ln(2K/\delta)}{2|D_{val}|}}
\right]
\le \delta
\]
</div>

---

### 5.6 Interpretation

From the bounds above we obtain two important conclusions:

1.  The estimation error decreases with dataset size: \\( O\left(\frac{1}{\sqrt{|D_{val}|}}\right) \\).
2.  Testing (K) hyperparameters only increases the risk by \\( O(\sqrt{\ln K}) \\).

---

### 5.7 Cross-Validation

**k-fold cross-validation** improves data efficiency.



Procedure:

1. Split dataset into (k) folds.
2. Train (k) models.
3. Average the validation errors:

<div>
\[
L_{CV} = \frac{1}{k} \sum_{i=1}^k L_i
\]
</div>