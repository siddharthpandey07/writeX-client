import { Spin } from "antd"

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spin size="large" />
    </div>
  )
}

export default LoadingSpinner
