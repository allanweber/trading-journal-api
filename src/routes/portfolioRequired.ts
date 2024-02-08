import { AuthenticatedRequest } from "./authenticated";

const portfolioRequired = async (req, res, next) => {
  const { portfolioId } = req.params;
  if (!portfolioId) return res.status(400).json({ message: "Portfolio id is required" });

  req.portfolioId = portfolioId;
  next();
};

export default portfolioRequired;

export interface AuthenticatedRequestWithPortfolio extends AuthenticatedRequest {
  portfolioId: string;
}
