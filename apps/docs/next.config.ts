import { withDocs } from "@farming-labs/next/config";

const nextConfig = {
	turbopack: {
		root: process.cwd(),
	},
};

export default withDocs(nextConfig);
